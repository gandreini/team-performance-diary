import { NextResponse } from 'next/server';
import { getEntriesByReportAndCycle } from '@/lib/entries';
import { getReportById } from '@/lib/reports';
import { ensureActiveCycle } from '@/lib/cycles';
import type { EntryType } from '@/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const cycleId = searchParams.get('cycle_id');
    const type = searchParams.get('type') as EntryType | null;

    // Verify report exists
    const report = await getReportById(id);
    if (!report) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      );
    }

    // Use provided cycle_id or get active cycle
    let effectiveCycleId = cycleId;
    if (!effectiveCycleId) {
      const activeCycle = await ensureActiveCycle();
      effectiveCycleId = activeCycle.id;
    }

    const entries = await getEntriesByReportAndCycle(
      id,
      effectiveCycleId,
      type || undefined
    );

    return NextResponse.json({ entries });
  } catch (error) {
    console.error('Error fetching entries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch entries' },
      { status: 500 }
    );
  }
}
