import { NextResponse } from 'next/server';
import { db, cycles, reports, entries, archivedGoals, developmentGoals, entryGoals, reportSummaries } from '@/db';
import type { Cycle, Report, Entry, ArchivedGoal, DevelopmentGoal, EntryGoal, ReportSummary } from '@/db';

interface BackupData {
  version: number;
  exportedAt: string;
  data: {
    cycles: Cycle[];
    reports: Report[];
    entries: Entry[];
    archivedGoals: ArchivedGoal[];
    // New in v2 - optional for backward compatibility with v1 backups
    developmentGoals?: DevelopmentGoal[];
    entryGoals?: EntryGoal[];
    // New in v3 - optional for backward compatibility
    reportSummaries?: ReportSummary[];
  };
}

export async function POST(request: Request) {
  try {
    const backup: BackupData = await request.json();

    // Validate backup structure
    if (!backup.version || !backup.data) {
      return NextResponse.json(
        { error: 'Invalid backup file format' },
        { status: 400 }
      );
    }

    if (!backup.data.cycles || !backup.data.reports || !backup.data.entries) {
      return NextResponse.json(
        { error: 'Backup file is missing required data' },
        { status: 400 }
      );
    }

    // Delete existing data in correct order (respecting foreign keys)
    await db.delete(entryGoals);  // References entries and developmentGoals
    await db.delete(reportSummaries);  // References reports and cycles
    await db.delete(entries);
    await db.delete(developmentGoals);  // References reports
    await db.delete(archivedGoals);
    await db.delete(reports);
    await db.delete(cycles);

    // Insert data in correct order
    if (backup.data.cycles.length > 0) {
      await db.insert(cycles).values(backup.data.cycles);
    }

    if (backup.data.reports.length > 0) {
      await db.insert(reports).values(backup.data.reports);
    }

    // v2: Insert development goals before entries (so entry_goals can reference them)
    if (backup.data.developmentGoals && backup.data.developmentGoals.length > 0) {
      await db.insert(developmentGoals).values(backup.data.developmentGoals);
    }

    if (backup.data.entries.length > 0) {
      await db.insert(entries).values(backup.data.entries);
    }

    // v2: Insert entry-goal links after both entries and goals exist
    if (backup.data.entryGoals && backup.data.entryGoals.length > 0) {
      await db.insert(entryGoals).values(backup.data.entryGoals);
    }

    if (backup.data.archivedGoals && backup.data.archivedGoals.length > 0) {
      await db.insert(archivedGoals).values(backup.data.archivedGoals);
    }

    // v3: Insert report summaries after both reports and cycles exist
    if (backup.data.reportSummaries && backup.data.reportSummaries.length > 0) {
      await db.insert(reportSummaries).values(backup.data.reportSummaries);
    }

    return NextResponse.json({
      success: true,
      message: 'Backup restored successfully',
      stats: {
        cycles: backup.data.cycles.length,
        reports: backup.data.reports.length,
        entries: backup.data.entries.length,
        archivedGoals: backup.data.archivedGoals?.length || 0,
        developmentGoals: backup.data.developmentGoals?.length || 0,
        entryGoals: backup.data.entryGoals?.length || 0,
        reportSummaries: backup.data.reportSummaries?.length || 0,
      },
    });
  } catch (error) {
    console.error('Error restoring backup:', error);
    return NextResponse.json(
      { error: 'Failed to restore backup. The file may be corrupted or invalid.' },
      { status: 500 }
    );
  }
}
