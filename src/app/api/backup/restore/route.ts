import { NextResponse } from 'next/server';
import { db, cycles, reports, entries, archivedGoals } from '@/db';
import type { Cycle, Report, Entry, ArchivedGoal } from '@/db';

interface BackupData {
  version: number;
  exportedAt: string;
  data: {
    cycles: Cycle[];
    reports: Report[];
    entries: Entry[];
    archivedGoals: ArchivedGoal[];
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
    await db.delete(entries);
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

    if (backup.data.entries.length > 0) {
      await db.insert(entries).values(backup.data.entries);
    }

    if (backup.data.archivedGoals && backup.data.archivedGoals.length > 0) {
      await db.insert(archivedGoals).values(backup.data.archivedGoals);
    }

    return NextResponse.json({
      success: true,
      message: 'Backup restored successfully',
      stats: {
        cycles: backup.data.cycles.length,
        reports: backup.data.reports.length,
        entries: backup.data.entries.length,
        archivedGoals: backup.data.archivedGoals?.length || 0,
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
