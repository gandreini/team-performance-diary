import { db, archivedGoals, reports, developmentGoals, type ArchivedGoal, type NewArchivedGoal, type ArchivedGoalSnapshot } from '@/db';
import { eq, and, asc } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

export async function getArchivedGoals(reportId: string, cycleId: string): Promise<ArchivedGoal | null> {
  const result = await db.select()
    .from(archivedGoals)
    .where(and(eq(archivedGoals.reportId, reportId), eq(archivedGoals.cycleId, cycleId)))
    .limit(1);
  return result[0] || null;
}

export async function archiveGoalsForCycle(cycleId: string): Promise<void> {
  // Get all reports
  const allReports = await db.select().from(reports);

  // For each report, snapshot their development goals
  for (const report of allReports) {
    // Get structured goals for this report
    const goals = await db.select()
      .from(developmentGoals)
      .where(eq(developmentGoals.reportId, report.id))
      .orderBy(asc(developmentGoals.sortOrder));

    // Only create archive if there are goals (structured or legacy)
    if (goals.length > 0 || report.developmentGoals) {
      // Create snapshot from structured goals
      const goalsSnapshot: ArchivedGoalSnapshot[] = goals.map(g => ({
        id: g.id,
        title: g.title,
        description: g.description,
        sortOrder: g.sortOrder,
      }));

      const newArchivedGoal: NewArchivedGoal = {
        id: uuidv4(),
        reportId: report.id,
        cycleId,
        developmentGoals: report.developmentGoals, // Keep legacy for backward compatibility
        goalsSnapshot: goalsSnapshot.length > 0 ? JSON.stringify(goalsSnapshot) : null,
        createdAt: new Date().toISOString(),
      };

      // Check if already exists (shouldn't happen, but be safe)
      const existing = await getArchivedGoals(report.id, cycleId);
      if (!existing) {
        await db.insert(archivedGoals).values(newArchivedGoal);
      }
    }
  }

  // Note: We no longer clear development goals since they persist across cycles
  // The old developmentGoals text field on reports is deprecated
}

export async function getArchivedGoalsByCycle(cycleId: string): Promise<ArchivedGoal[]> {
  return db.select()
    .from(archivedGoals)
    .where(eq(archivedGoals.cycleId, cycleId));
}
