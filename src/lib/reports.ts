import { db, reports, entries, archivedGoals, reportSummaries, type Report, type NewReport } from '@/db';
import { eq, and, count, asc } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

export async function getAllReports(): Promise<Report[]> {
  const result = await db.select().from(reports)
    .orderBy(asc(reports.firstName), asc(reports.lastName));
  return result;
}

export async function getReportById(id: string): Promise<Report | null> {
  const result = await db.select().from(reports).where(eq(reports.id, id)).limit(1);
  return result[0] || null;
}

export async function createReport(
  firstName: string,
  lastName: string,
  developmentGoals?: string | null
): Promise<Report> {
  const now = new Date().toISOString();
  const newReport: NewReport = {
    id: uuidv4(),
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    developmentGoals: developmentGoals || null,
    createdAt: now,
    updatedAt: now,
  };

  await db.insert(reports).values(newReport);
  return newReport as Report;
}

export async function updateReport(
  id: string,
  data: { firstName?: string; lastName?: string; developmentGoals?: string | null }
): Promise<Report | null> {
  const existing = await getReportById(id);
  if (!existing) return null;

  const updateData: Partial<Report> = {
    updatedAt: new Date().toISOString(),
  };

  if (data.firstName !== undefined) {
    updateData.firstName = data.firstName.trim();
  }
  if (data.lastName !== undefined) {
    updateData.lastName = data.lastName.trim();
  }
  if (data.developmentGoals !== undefined) {
    updateData.developmentGoals = data.developmentGoals;
  }

  await db.update(reports).set(updateData).where(eq(reports.id, id));

  return getReportById(id);
}

export async function deleteReport(id: string): Promise<boolean> {
  const existing = await getReportById(id);
  if (!existing) return false;

  // Cascade deletes are handled by the database, but let's be explicit
  await db.delete(reportSummaries).where(eq(reportSummaries.reportId, id));
  await db.delete(archivedGoals).where(eq(archivedGoals.reportId, id));
  await db.delete(entries).where(eq(entries.reportId, id));
  await db.delete(reports).where(eq(reports.id, id));

  return true;
}

export async function getReportEntryCount(reportId: string, cycleId: string): Promise<number> {
  const result = await db.select({ count: count() })
    .from(entries)
    .where(and(eq(entries.reportId, reportId), eq(entries.cycleId, cycleId)));
  return result[0]?.count || 0;
}

export async function getReportsWithEntryCounts(cycleId: string): Promise<(Report & { entryCount: number })[]> {
  const allReports = await getAllReports();

  const reportsWithCounts = await Promise.all(
    allReports.map(async (report) => {
      const entryCount = await getReportEntryCount(report.id, cycleId);
      return { ...report, entryCount };
    })
  );

  return reportsWithCounts;
}

export async function getTotalEntryCount(reportId: string): Promise<number> {
  const result = await db.select({ count: count() })
    .from(entries)
    .where(eq(entries.reportId, reportId));
  return result[0]?.count || 0;
}
