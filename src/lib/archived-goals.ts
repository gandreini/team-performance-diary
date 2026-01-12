import { db, archivedGoals, reports, type ArchivedGoal, type NewArchivedGoal } from '@/db';
import { eq, and } from 'drizzle-orm';
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

  // For each report, copy their development_goals to archived_goals
  for (const report of allReports) {
    if (report.developmentGoals) {
      const newArchivedGoal: NewArchivedGoal = {
        id: uuidv4(),
        reportId: report.id,
        cycleId,
        developmentGoals: report.developmentGoals,
        createdAt: new Date().toISOString(),
      };

      // Check if already exists (shouldn't happen, but be safe)
      const existing = await getArchivedGoals(report.id, cycleId);
      if (!existing) {
        await db.insert(archivedGoals).values(newArchivedGoal);
      }
    }
  }

  // Clear development_goals for all reports
  await db.update(reports).set({
    developmentGoals: null,
    updatedAt: new Date().toISOString()
  });
}

export async function getArchivedGoalsByCycle(cycleId: string): Promise<ArchivedGoal[]> {
  return db.select()
    .from(archivedGoals)
    .where(eq(archivedGoals.cycleId, cycleId));
}
