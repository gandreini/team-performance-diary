import { NextResponse } from 'next/server';
import { getAllReports, createReport } from '@/lib/reports';

export async function GET() {
  try {
    const reports = await getAllReports();
    return NextResponse.json({ reports });
  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reports' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { first_name, last_name, development_goals } = body;

    // Validate first_name
    if (!first_name || typeof first_name !== 'string') {
      return NextResponse.json(
        { error: 'First name is required' },
        { status: 400 }
      );
    }

    const trimmedFirstName = first_name.trim();
    if (trimmedFirstName.length < 1 || trimmedFirstName.length > 50) {
      return NextResponse.json(
        { error: 'First name must be between 1 and 50 characters' },
        { status: 400 }
      );
    }

    // Validate last_name
    if (!last_name || typeof last_name !== 'string') {
      return NextResponse.json(
        { error: 'Last name is required' },
        { status: 400 }
      );
    }

    const trimmedLastName = last_name.trim();
    if (trimmedLastName.length < 1 || trimmedLastName.length > 50) {
      return NextResponse.json(
        { error: 'Last name must be between 1 and 50 characters' },
        { status: 400 }
      );
    }

    // Validate development_goals (optional)
    if (development_goals && typeof development_goals === 'string' && development_goals.length > 5000) {
      return NextResponse.json(
        { error: 'Development goals must be at most 5000 characters' },
        { status: 400 }
      );
    }

    const report = await createReport(
      trimmedFirstName,
      trimmedLastName,
      development_goals || null
    );

    return NextResponse.json({ report }, { status: 201 });
  } catch (error) {
    console.error('Error creating report:', error);
    return NextResponse.json(
      { error: 'Failed to create report' },
      { status: 500 }
    );
  }
}
