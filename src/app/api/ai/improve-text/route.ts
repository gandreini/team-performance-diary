import { NextResponse } from 'next/server';
import { improveText } from '@/lib/ai';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { text, context } = body;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Text is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    const improvedText = await improveText(text, context || '');

    return NextResponse.json({ improved_text: improvedText });
  } catch (error) {
    console.error('Error improving text:', error);
    const message = error instanceof Error ? error.message : 'Failed to improve text';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
