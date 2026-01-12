import { NextResponse } from 'next/server';
import { getEntryById, updateEntry, deleteEntry } from '@/lib/entries';

function isValidUrl(string: string): boolean {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const entry = await getEntryById(id);

    if (!entry) {
      return NextResponse.json(
        { error: 'Entry not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ entry });
  } catch (error) {
    console.error('Error fetching entry:', error);
    return NextResponse.json(
      { error: 'Failed to fetch entry' },
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

    const existingEntry = await getEntryById(id);
    if (!existingEntry) {
      return NextResponse.json(
        { error: 'Entry not found' },
        { status: 404 }
      );
    }

    // Validate based on entry type
    const updateData: Record<string, unknown> = {};

    switch (existingEntry.entryType) {
      case 'feedback': {
        const { feedback_type, situation, behavior, impact, notes } = body;

        if (feedback_type !== undefined) {
          if (!['positive', 'constructive'].includes(feedback_type)) {
            return NextResponse.json(
              { error: 'Invalid feedback type' },
              { status: 400 }
            );
          }
          updateData.feedbackType = feedback_type;
        }

        if (situation !== undefined) {
          if (typeof situation !== 'string' || situation.trim().length === 0) {
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
          updateData.situation = situation.trim();
        }

        if (behavior !== undefined) {
          if (typeof behavior !== 'string' || behavior.trim().length === 0) {
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
          updateData.behavior = behavior.trim();
        }

        if (impact !== undefined) {
          if (typeof impact !== 'string' || impact.trim().length === 0) {
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
          updateData.impact = impact.trim();
        }

        if (notes !== undefined) {
          if (notes && typeof notes === 'string' && notes.length > 2000) {
            return NextResponse.json(
              { error: 'Notes must be at most 2000 characters' },
              { status: 400 }
            );
          }
          updateData.notes = notes || null;
        }
        break;
      }

      case 'accomplishment':
      case 'notes':
      case 'career_conversation': {
        const { notes } = body;

        if (notes !== undefined) {
          if (typeof notes !== 'string' || notes.trim().length === 0) {
            return NextResponse.json(
              { error: 'Content is required' },
              { status: 400 }
            );
          }
          if (notes.length > 5000) {
            return NextResponse.json(
              { error: 'Content must be at most 5000 characters' },
              { status: 400 }
            );
          }
          updateData.notes = notes.trim();
        }
        break;
      }

      case 'kudos': {
        const { notes, link } = body;

        if (notes !== undefined) {
          if (typeof notes !== 'string' || notes.trim().length === 0) {
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
          updateData.notes = notes.trim();
        }

        if (link !== undefined) {
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
            updateData.link = link.trim();
          } else {
            updateData.link = null;
          }
        }
        break;
      }

      case 'third_party_feedback': {
        const { provider_name, notes } = body;

        if (provider_name !== undefined) {
          if (typeof provider_name !== 'string' || provider_name.trim().length === 0) {
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
          updateData.providerName = provider_name.trim();
        }

        if (notes !== undefined) {
          if (typeof notes !== 'string' || notes.trim().length === 0) {
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
          updateData.notes = notes.trim();
        }
        break;
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    const entry = await updateEntry(id, updateData);

    return NextResponse.json({ entry });
  } catch (error) {
    console.error('Error updating entry:', error);
    return NextResponse.json(
      { error: 'Failed to update entry' },
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
    const success = await deleteEntry(id);

    if (!success) {
      return NextResponse.json(
        { error: 'Entry not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting entry:', error);
    return NextResponse.json(
      { error: 'Failed to delete entry' },
      { status: 500 }
    );
  }
}
