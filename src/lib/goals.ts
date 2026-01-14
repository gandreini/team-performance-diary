import { db } from '@/db';
import { developmentGoals, entryGoals, type DevelopmentGoal, type NewDevelopmentGoal } from '@/db/schema';
import { eq, asc, inArray } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

// Get all goals for a report, ordered by sortOrder
export async function getGoalsByReport(reportId: string): Promise<DevelopmentGoal[]> {
  return db
    .select()
    .from(developmentGoals)
    .where(eq(developmentGoals.reportId, reportId))
    .orderBy(asc(developmentGoals.sortOrder));
}

// Get a single goal by ID
export async function getGoalById(id: string): Promise<DevelopmentGoal | null> {
  const results = await db
    .select()
    .from(developmentGoals)
    .where(eq(developmentGoals.id, id));
  return results[0] || null;
}

// Create a new goal
export async function createGoal(
  reportId: string,
  title: string,
  description?: string
): Promise<DevelopmentGoal> {
  // Get the max sort order for this report
  const existingGoals = await getGoalsByReport(reportId);
  const maxSortOrder = existingGoals.length > 0
    ? Math.max(...existingGoals.map(g => g.sortOrder))
    : -1;

  const now = new Date().toISOString();
  const newGoal: NewDevelopmentGoal = {
    id: uuidv4(),
    reportId,
    title,
    description: description || null,
    sortOrder: maxSortOrder + 1,
    createdAt: now,
    updatedAt: now,
  };

  await db.insert(developmentGoals).values(newGoal);
  return newGoal as DevelopmentGoal;
}

// Update a goal
export async function updateGoal(
  id: string,
  data: { title?: string; description?: string }
): Promise<DevelopmentGoal | null> {
  const existing = await getGoalById(id);
  if (!existing) return null;

  const now = new Date().toISOString();
  await db
    .update(developmentGoals)
    .set({
      ...data,
      updatedAt: now,
    })
    .where(eq(developmentGoals.id, id));

  return getGoalById(id);
}

// Delete a goal
export async function deleteGoal(id: string): Promise<boolean> {
  const existing = await getGoalById(id);
  if (!existing) return false;

  await db.delete(developmentGoals).where(eq(developmentGoals.id, id));
  return true;
}

// Reorder goals for a report
export async function reorderGoals(reportId: string, goalIds: string[]): Promise<void> {
  const now = new Date().toISOString();

  for (let i = 0; i < goalIds.length; i++) {
    await db
      .update(developmentGoals)
      .set({ sortOrder: i, updatedAt: now })
      .where(eq(developmentGoals.id, goalIds[i]));
  }
}

// Link an entry to goals (replaces existing links)
export async function linkEntryToGoals(entryId: string, goalIds: string[]): Promise<void> {
  // Delete existing links
  await db.delete(entryGoals).where(eq(entryGoals.entryId, entryId));

  // Create new links
  if (goalIds.length > 0) {
    const now = new Date().toISOString();
    const newLinks = goalIds.map(goalId => ({
      id: uuidv4(),
      entryId,
      goalId,
      createdAt: now,
    }));
    await db.insert(entryGoals).values(newLinks);
  }
}

// Get goals linked to an entry
export async function getGoalsForEntry(entryId: string): Promise<DevelopmentGoal[]> {
  const links = await db
    .select()
    .from(entryGoals)
    .where(eq(entryGoals.entryId, entryId));

  if (links.length === 0) return [];

  const goalIds = links.map(l => l.goalId);
  return db
    .select()
    .from(developmentGoals)
    .where(inArray(developmentGoals.id, goalIds))
    .orderBy(asc(developmentGoals.sortOrder));
}

// Get goal IDs linked to an entry
export async function getGoalIdsForEntry(entryId: string): Promise<string[]> {
  const links = await db
    .select()
    .from(entryGoals)
    .where(eq(entryGoals.entryId, entryId));
  return links.map(l => l.goalId);
}
