import { NextResponse } from 'next/server';
import { getArchivedGoals } from '@/lib/archived-goals';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ reportId: string; cycleId: string }> }
) {
  try {
    const { reportId, cycleId } = await params;
    const goals = await getArchivedGoals(reportId, cycleId);

    return NextResponse.json({ goals });
  } catch (error) {
    console.error('Error fetching archived goals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch archived goals' },
      { status: 500 }
    );
  }
}
