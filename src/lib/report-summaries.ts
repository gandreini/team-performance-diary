import { db, reportSummaries, type ReportSummary } from '@/db';
import { eq, and } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

export async function getSummary(
  reportId: string,
  cycleId: string
): Promise<ReportSummary | null> {
  const result = await db
    .select()
    .from(reportSummaries)
    .where(
      and(
        eq(reportSummaries.reportId, reportId),
        eq(reportSummaries.cycleId, cycleId)
      )
    )
    .limit(1);
  return result[0] || null;
}

export async function upsertSummary(
  reportId: string,
  cycleId: string,
  content: string
): Promise<ReportSummary> {
  const now = new Date().toISOString();
  const id = uuidv4();

  await db
    .insert(reportSummaries)
    .values({
      id,
      reportId,
      cycleId,
      content,
      generatedAt: now,
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: [reportSummaries.reportId, reportSummaries.cycleId],
      set: {
        content,
        generatedAt: now,
        updatedAt: now,
      },
    });

  // Return the current row (either newly inserted or updated)
  const result = await getSummary(reportId, cycleId);
  return result!;
}

export async function deleteSummariesByReport(reportId: string): Promise<void> {
  await db.delete(reportSummaries).where(eq(reportSummaries.reportId, reportId));
}
