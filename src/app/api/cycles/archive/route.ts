import { NextResponse } from 'next/server';
import { archiveCycleAndCreateNew, cycleNameExists } from '@/lib/cycles';
import { archiveGoalsForCycle } from '@/lib/archived-goals';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { new_cycle_name } = body;

    if (!new_cycle_name || typeof new_cycle_name !== 'string') {
      return NextResponse.json(
        { error: 'New cycle name is required' },
        { status: 400 }
      );
    }

    const trimmedName = new_cycle_name.trim();
    if (trimmedName.length < 1 || trimmedName.length > 50) {
      return NextResponse.json(
        { error: 'Cycle name must be between 1 and 50 characters' },
        { status: 400 }
      );
    }

    const exists = await cycleNameExists(trimmedName);
    if (exists) {
      return NextResponse.json(
        { error: 'A cycle with this name already exists' },
        { status: 400 }
      );
    }

    // Archive the current cycle and get the archived cycle info
    const result = await archiveCycleAndCreateNew(trimmedName);

    // Archive goals for the old cycle
    await archiveGoalsForCycle(result.archived.id);

    return NextResponse.json({
      archived: result.archived,
      new: result.new,
    });
  } catch (error) {
    console.error('Error archiving cycle:', error);
    return NextResponse.json(
      { error: 'Failed to archive cycle' },
      { status: 500 }
    );
  }
}
