import { NextRequest, NextResponse } from 'next/server';
import { getReportById } from '@/lib/reports';
import { getEntriesByReportAndCycle } from '@/lib/entries';
import { getGoalsByReport, getGoalLinksForEntries } from '@/lib/goals';
import { getSummary, upsertSummary } from '@/lib/report-summaries';
import { generateReportSummary, type ReportSummaryEntry } from '@/lib/ai';

// GET /api/reports/[id]/summary?cycle_id=...
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cycleId = request.nextUrl.searchParams.get('cycle_id');

    if (!cycleId) {
      return NextResponse.json(
        { error: 'cycle_id query parameter is required' },
        { status: 400 }
      );
    }

    const report = await getReportById(id);
    if (!report) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      );
    }

    const summary = await getSummary(id, cycleId);
    return NextResponse.json({ summary });
  } catch (error) {
    console.error('Error fetching summary:', error);
    return NextResponse.json(
      { error: 'Failed to fetch summary' },
      { status: 500 }
    );
  }
}

// POST /api/reports/[id]/summary - Generate/regenerate summary
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { cycle_id } = body;

    if (!cycle_id) {
      return NextResponse.json(
        { error: 'cycle_id is required' },
        { status: 400 }
      );
    }

    const report = await getReportById(id);
    if (!report) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      );
    }

    // Collect all entries for this report+cycle
    const entries = await getEntriesByReportAndCycle(id, cycle_id);

    if (entries.length === 0) {
      return NextResponse.json(
        { error: 'No entries found for this report and cycle' },
        { status: 400 }
      );
    }

    // Collect development goals
    const goals = await getGoalsByReport(id);

    // Batch-fetch all entry-goal links in one query (avoids N+1)
    const goalLinksMap = await getGoalLinksForEntries(entries.map((e) => e.id));

    // Build entry payloads with linked goal titles
    const entryPayloads: ReportSummaryEntry[] = entries.map((entry) => {
      const linkedGoalIds = goalLinksMap.get(entry.id) || [];
      const linkedGoalTitles = goals
        .filter((g) => linkedGoalIds.includes(g.id))
        .map((g) => g.title);

      return {
        entryType: entry.entryType,
        feedbackType: entry.feedbackType,
        feedbackGiven: entry.feedbackGiven,
        situation: entry.situation,
        behavior: entry.behavior,
        impact: entry.impact,
        title: entry.title,
        notes: entry.notes,
        providerName: entry.providerName,
        linkedGoals: linkedGoalTitles,
      };
    });

    // Call N8N to generate summary
    const summaryText = await generateReportSummary({
      report: { firstName: report.firstName, lastName: report.lastName },
      goals: goals.map((g) => ({ title: g.title, description: g.description })),
      entries: entryPayloads,
    });

    // Store summary
    const summary = await upsertSummary(id, cycle_id, summaryText);

    return NextResponse.json({ summary });
  } catch (error) {
    console.error('Error generating summary:', error);
    const message = error instanceof Error ? error.message : 'Failed to generate summary';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
