import { NextResponse } from 'next/server';
import { getAllCycles, createCycle, cycleNameExists } from '@/lib/cycles';

export async function GET() {
  try {
    const cycles = await getAllCycles();
    return NextResponse.json({ cycles });
  } catch (error) {
    console.error('Error fetching cycles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cycles' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, start_date } = body;

    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    const trimmedName = name.trim();
    if (trimmedName.length < 1 || trimmedName.length > 50) {
      return NextResponse.json(
        { error: 'Name must be between 1 and 50 characters' },
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

    const startDate = start_date || new Date().toISOString().split('T')[0];
    const cycle = await createCycle(trimmedName, startDate);

    return NextResponse.json({ cycle }, { status: 201 });
  } catch (error) {
    console.error('Error creating cycle:', error);
    return NextResponse.json(
      { error: 'Failed to create cycle' },
      { status: 500 }
    );
  }
}
