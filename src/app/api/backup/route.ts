import { NextResponse } from 'next/server';
import { db, cycles, reports, entries, archivedGoals, developmentGoals, entryGoals } from '@/db';

export async function GET() {
  try {
    // Export all data from all tables
    const [allCycles, allReports, allEntries, allArchivedGoals, allDevelopmentGoals, allEntryGoals] = await Promise.all([
      db.select().from(cycles),
      db.select().from(reports),
      db.select().from(entries),
      db.select().from(archivedGoals),
      db.select().from(developmentGoals),
      db.select().from(entryGoals),
    ]);

    const backup = {
      version: 2, // Incremented to indicate new tables
      exportedAt: new Date().toISOString(),
      data: {
        cycles: allCycles,
        reports: allReports,
        entries: allEntries,
        archivedGoals: allArchivedGoals,
        developmentGoals: allDevelopmentGoals,
        entryGoals: allEntryGoals,
      },
    };

    // Return as downloadable JSON file
    return new NextResponse(JSON.stringify(backup, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="tpd-backup-${new Date().toISOString().split('T')[0]}.json"`,
      },
    });
  } catch (error) {
    console.error('Error creating backup:', error);
    return NextResponse.json(
      { error: 'Failed to create backup' },
      { status: 500 }
    );
  }
}
