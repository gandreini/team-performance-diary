import { NextResponse } from 'next/server';
import { ensureActiveCycle } from '@/lib/cycles';

export async function GET() {
  try {
    const cycle = await ensureActiveCycle();
    return NextResponse.json({ cycle });
  } catch (error) {
    console.error('Error fetching active cycle:', error);
    return NextResponse.json(
      { error: 'Failed to fetch active cycle' },
      { status: 500 }
    );
  }
}
