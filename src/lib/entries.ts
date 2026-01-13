import { db, entries, type Entry, type NewEntry, type EntryType, type FeedbackType } from '@/db';
import { eq, and, desc } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

export async function getEntriesByReportAndCycle(
  reportId: string,
  cycleId: string,
  entryType?: EntryType
): Promise<Entry[]> {
  if (entryType) {
    return db.select()
      .from(entries)
      .where(and(
        eq(entries.reportId, reportId),
        eq(entries.cycleId, cycleId),
        eq(entries.entryType, entryType)
      ))
      .orderBy(desc(entries.createdAt));
  }

  return db.select()
    .from(entries)
    .where(and(eq(entries.reportId, reportId), eq(entries.cycleId, cycleId)))
    .orderBy(desc(entries.createdAt));
}

export async function getEntryById(id: string): Promise<Entry | null> {
  const result = await db.select().from(entries).where(eq(entries.id, id)).limit(1);
  return result[0] || null;
}

export interface CreateFeedbackData {
  reportId: string;
  cycleId: string;
  feedbackType: FeedbackType;
  situation: string;
  behavior: string;
  impact: string;
  notes?: string | null;
}

export interface CreateSimpleEntryData {
  reportId: string;
  cycleId: string;
  notes: string;
}

export interface CreateAccomplishmentData {
  reportId: string;
  cycleId: string;
  title?: string | null;
  notes: string;
}

export interface CreateKudosData {
  reportId: string;
  cycleId: string;
  notes: string;
  link?: string | null;
}

export interface CreateThirdPartyFeedbackData {
  reportId: string;
  cycleId: string;
  providerName: string;
  notes: string;
}

export async function createFeedbackEntry(data: CreateFeedbackData): Promise<Entry> {
  const now = new Date().toISOString();
  const newEntry: NewEntry = {
    id: uuidv4(),
    reportId: data.reportId,
    cycleId: data.cycleId,
    entryType: 'feedback',
    feedbackType: data.feedbackType,
    situation: data.situation,
    behavior: data.behavior,
    impact: data.impact,
    notes: data.notes || null,
    createdAt: now,
    updatedAt: now,
  };

  await db.insert(entries).values(newEntry);
  return newEntry as Entry;
}

export async function createAccomplishmentEntry(data: CreateAccomplishmentData): Promise<Entry> {
  const now = new Date().toISOString();
  const newEntry: NewEntry = {
    id: uuidv4(),
    reportId: data.reportId,
    cycleId: data.cycleId,
    entryType: 'accomplishment',
    title: data.title || null,
    notes: data.notes,
    createdAt: now,
    updatedAt: now,
  };

  await db.insert(entries).values(newEntry);
  return newEntry as Entry;
}

export async function createKudosEntry(data: CreateKudosData): Promise<Entry> {
  const now = new Date().toISOString();
  const newEntry: NewEntry = {
    id: uuidv4(),
    reportId: data.reportId,
    cycleId: data.cycleId,
    entryType: 'kudos',
    notes: data.notes,
    link: data.link || null,
    createdAt: now,
    updatedAt: now,
  };

  await db.insert(entries).values(newEntry);
  return newEntry as Entry;
}

export async function createNotesEntry(data: CreateSimpleEntryData): Promise<Entry> {
  const now = new Date().toISOString();
  const newEntry: NewEntry = {
    id: uuidv4(),
    reportId: data.reportId,
    cycleId: data.cycleId,
    entryType: 'notes',
    notes: data.notes,
    createdAt: now,
    updatedAt: now,
  };

  await db.insert(entries).values(newEntry);
  return newEntry as Entry;
}

export async function createCareerConversationEntry(data: CreateSimpleEntryData): Promise<Entry> {
  const now = new Date().toISOString();
  const newEntry: NewEntry = {
    id: uuidv4(),
    reportId: data.reportId,
    cycleId: data.cycleId,
    entryType: 'career_conversation',
    notes: data.notes,
    createdAt: now,
    updatedAt: now,
  };

  await db.insert(entries).values(newEntry);
  return newEntry as Entry;
}

export async function createThirdPartyFeedbackEntry(data: CreateThirdPartyFeedbackData): Promise<Entry> {
  const now = new Date().toISOString();
  const newEntry: NewEntry = {
    id: uuidv4(),
    reportId: data.reportId,
    cycleId: data.cycleId,
    entryType: 'third_party_feedback',
    providerName: data.providerName.trim(),
    notes: data.notes,
    createdAt: now,
    updatedAt: now,
  };

  await db.insert(entries).values(newEntry);
  return newEntry as Entry;
}

export async function updateEntry(
  id: string,
  data: Partial<Omit<Entry, 'id' | 'reportId' | 'cycleId' | 'entryType' | 'createdAt'>>
): Promise<Entry | null> {
  const existing = await getEntryById(id);
  if (!existing) return null;

  const updateData = {
    ...data,
    updatedAt: new Date().toISOString(),
  };

  await db.update(entries).set(updateData).where(eq(entries.id, id));
  return getEntryById(id);
}

export async function deleteEntry(id: string): Promise<boolean> {
  const existing = await getEntryById(id);
  if (!existing) return false;

  await db.delete(entries).where(eq(entries.id, id));
  return true;
}
