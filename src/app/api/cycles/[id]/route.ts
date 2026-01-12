import { NextResponse } from 'next/server';
import { getCycleById } from '@/lib/cycles';
import { getAllReports } from '@/lib/reports';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cycle = await getCycleById(id);

    if (!cycle) {
      return NextResponse.json(
        { error: 'Cycle not found' },
        { status: 404 }
      );
    }

    const reports = await getAllReports();

    return NextResponse.json({ cycle, reports });
  } catch (error) {
    console.error('Error fetching cycle:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cycle' },
      { status: 500 }
    );
  }
}
