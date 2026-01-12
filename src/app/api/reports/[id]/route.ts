import { NextResponse } from 'next/server';
import { getReportById, updateReport, deleteReport } from '@/lib/reports';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const report = await getReportById(id);

    if (!report) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ report });
  } catch (error) {
    console.error('Error fetching report:', error);
    return NextResponse.json(
      { error: 'Failed to fetch report' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { first_name, last_name, development_goals } = body;

    // Validate first_name if provided
    if (first_name !== undefined) {
      if (typeof first_name !== 'string') {
        return NextResponse.json(
          { error: 'First name must be a string' },
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
    }

    // Validate last_name if provided
    if (last_name !== undefined) {
      if (typeof last_name !== 'string') {
        return NextResponse.json(
          { error: 'Last name must be a string' },
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
    }

    // Validate development_goals if provided
    if (development_goals !== undefined && development_goals !== null) {
      if (typeof development_goals === 'string' && development_goals.length > 5000) {
        return NextResponse.json(
          { error: 'Development goals must be at most 5000 characters' },
          { status: 400 }
        );
      }
    }

    const report = await updateReport(id, {
      firstName: first_name,
      lastName: last_name,
      developmentGoals: development_goals,
    });

    if (!report) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ report });
  } catch (error) {
    console.error('Error updating report:', error);
    return NextResponse.json(
      { error: 'Failed to update report' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const success = await deleteReport(id);

    if (!success) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting report:', error);
    return NextResponse.json(
      { error: 'Failed to delete report' },
      { status: 500 }
    );
  }
}
