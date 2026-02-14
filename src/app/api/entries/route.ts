import { NextResponse } from 'next/server';
import {
  createFeedbackEntry,
  createAccomplishmentEntry,
  createKudosEntry,
  createNotesEntry,
  createCareerConversationEntry,
  createThirdPartyFeedbackEntry,
} from '@/lib/entries';
import { getReportById } from '@/lib/reports';
import { ensureActiveCycle } from '@/lib/cycles';
import { linkEntryToGoals } from '@/lib/goals';
import type { EntryType, FeedbackType } from '@/db';

function isValidUrl(string: string): boolean {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { report_id, cycle_id, entry_type } = body;

    // Validate report_id
    if (!report_id || typeof report_id !== 'string') {
      return NextResponse.json(
        { error: 'Report ID is required' },
        { status: 400 }
      );
    }

    const report = await getReportById(report_id);
    if (!report) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 }
      );
    }

    // Get cycle_id (use active if not provided)
    let effectiveCycleId = cycle_id;
    if (!effectiveCycleId) {
      const activeCycle = await ensureActiveCycle();
      effectiveCycleId = activeCycle.id;
    }

    // Validate entry_type
    const validEntryTypes: EntryType[] = [
      'feedback',
      'accomplishment',
      'kudos',
      'notes',
      'career_conversation',
      'third_party_feedback',
    ];

    if (!entry_type || !validEntryTypes.includes(entry_type)) {
      return NextResponse.json(
        { error: 'Valid entry type is required' },
        { status: 400 }
      );
    }

    let entry;

    switch (entry_type as EntryType) {
      case 'feedback': {
        const { feedback_type, situation, behavior, impact, notes } = body;

        // Validate feedback_type
        if (!feedback_type || !['positive', 'constructive'].includes(feedback_type)) {
          return NextResponse.json(
            { error: 'Please select feedback type' },
            { status: 400 }
          );
        }

        // Validate situation
        if (!situation || typeof situation !== 'string' || situation.trim().length === 0) {
          return NextResponse.json(
            { error: 'Situation is required' },
            { status: 400 }
          );
        }
        if (situation.length > 1000) {
          return NextResponse.json(
            { error: 'Situation must be at most 1000 characters' },
            { status: 400 }
          );
        }

        // Validate behavior
        if (!behavior || typeof behavior !== 'string' || behavior.trim().length === 0) {
          return NextResponse.json(
            { error: 'Behavior is required' },
            { status: 400 }
          );
        }
        if (behavior.length > 1000) {
          return NextResponse.json(
            { error: 'Behavior must be at most 1000 characters' },
            { status: 400 }
          );
        }

        // Validate impact
        if (!impact || typeof impact !== 'string' || impact.trim().length === 0) {
          return NextResponse.json(
            { error: 'Impact is required' },
            { status: 400 }
          );
        }
        if (impact.length > 1000) {
          return NextResponse.json(
            { error: 'Impact must be at most 1000 characters' },
            { status: 400 }
          );
        }

        // Validate notes (optional)
        if (notes && typeof notes === 'string' && notes.length > 2000) {
          return NextResponse.json(
            { error: 'Notes must be at most 2000 characters' },
            { status: 400 }
          );
        }

        entry = await createFeedbackEntry({
          reportId: report_id,
          cycleId: effectiveCycleId,
          feedbackType: feedback_type as FeedbackType,
          situation: situation.trim(),
          behavior: behavior.trim(),
          impact: impact.trim(),
          notes: notes || null,
        });
        break;
      }

      case 'accomplishment': {
        const { title, notes } = body;

        if (!notes || typeof notes !== 'string' || notes.trim().length === 0) {
          return NextResponse.json(
            { error: 'Description is required' },
            { status: 400 }
          );
        }
        if (notes.length > 5000) {
          return NextResponse.json(
            { error: 'Description must be at most 5000 characters' },
            { status: 400 }
          );
        }
        if (title && typeof title === 'string' && title.length > 200) {
          return NextResponse.json(
            { error: 'Title must be at most 200 characters' },
            { status: 400 }
          );
        }

        entry = await createAccomplishmentEntry({
          reportId: report_id,
          cycleId: effectiveCycleId,
          title: title?.trim() || null,
          notes: notes.trim(),
        });
        break;
      }

      case 'kudos': {
        const { notes, link } = body;

        if (!notes || typeof notes !== 'string' || notes.trim().length === 0) {
          return NextResponse.json(
            { error: 'Description is required' },
            { status: 400 }
          );
        }
        if (notes.length > 5000) {
          return NextResponse.json(
            { error: 'Description must be at most 5000 characters' },
            { status: 400 }
          );
        }

        if (link && typeof link === 'string' && link.trim().length > 0) {
          if (!isValidUrl(link)) {
            return NextResponse.json(
              { error: 'Please enter a valid URL' },
              { status: 400 }
            );
          }
          if (link.length > 500) {
            return NextResponse.json(
              { error: 'Link must be at most 500 characters' },
              { status: 400 }
            );
          }
        }

        entry = await createKudosEntry({
          reportId: report_id,
          cycleId: effectiveCycleId,
          notes: notes.trim(),
          link: link?.trim() || null,
        });
        break;
      }

      case 'notes': {
        const { notes } = body;

        if (!notes || typeof notes !== 'string' || notes.trim().length === 0) {
          return NextResponse.json(
            { error: 'Note content is required' },
            { status: 400 }
          );
        }
        if (notes.length > 5000) {
          return NextResponse.json(
            { error: 'Note must be at most 5000 characters' },
            { status: 400 }
          );
        }

        entry = await createNotesEntry({
          reportId: report_id,
          cycleId: effectiveCycleId,
          notes: notes.trim(),
        });
        break;
      }

      case 'career_conversation': {
        const { notes } = body;

        if (!notes || typeof notes !== 'string' || notes.trim().length === 0) {
          return NextResponse.json(
            { error: 'Conversation notes are required' },
            { status: 400 }
          );
        }
        if (notes.length > 5000) {
          return NextResponse.json(
            { error: 'Notes must be at most 5000 characters' },
            { status: 400 }
          );
        }

        entry = await createCareerConversationEntry({
          reportId: report_id,
          cycleId: effectiveCycleId,
          notes: notes.trim(),
        });
        break;
      }

      case 'third_party_feedback': {
        const { provider_name, notes } = body;

        if (!provider_name || typeof provider_name !== 'string' || provider_name.trim().length === 0) {
          return NextResponse.json(
            { error: 'Feedback provider is required' },
            { status: 400 }
          );
        }
        if (provider_name.trim().length > 100) {
          return NextResponse.json(
            { error: 'Provider name must be at most 100 characters' },
            { status: 400 }
          );
        }

        if (!notes || typeof notes !== 'string' || notes.trim().length === 0) {
          return NextResponse.json(
            { error: 'Feedback content is required' },
            { status: 400 }
          );
        }
        if (notes.length > 5000) {
          return NextResponse.json(
            { error: 'Feedback must be at most 5000 characters' },
            { status: 400 }
          );
        }

        entry = await createThirdPartyFeedbackEntry({
          reportId: report_id,
          cycleId: effectiveCycleId,
          providerName: provider_name.trim(),
          notes: notes.trim(),
        });
        break;
      }

      default:
        return NextResponse.json(
          { error: 'Invalid entry type' },
          { status: 400 }
        );
    }

    // Link goals if provided
    if (body.goal_ids && Array.isArray(body.goal_ids)) {
      await linkEntryToGoals(entry.id, body.goal_ids);
    }

    return NextResponse.json({ entry }, { status: 201 });
  } catch (error) {
    console.error('Error creating entry:', error);
    return NextResponse.json(
      { error: 'Failed to create entry' },
      { status: 500 }
    );
  }
}
