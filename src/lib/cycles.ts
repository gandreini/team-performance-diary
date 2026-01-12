import { db, cycles, type Cycle, type NewCycle } from '@/db';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

export async function getActiveCycle(): Promise<Cycle | null> {
  const result = await db.select().from(cycles).where(eq(cycles.status, 'active')).limit(1);
  return result[0] || null;
}

export async function getAllCycles(): Promise<Cycle[]> {
  return db.select().from(cycles).orderBy(cycles.createdAt);
}

export async function getArchivedCycles(): Promise<Cycle[]> {
  const result = await db.select().from(cycles).where(eq(cycles.status, 'archived'));
  // Sort by end_date descending (most recent first)
  return result.sort((a, b) => {
    if (!a.endDate) return 1;
    if (!b.endDate) return -1;
    return b.endDate.localeCompare(a.endDate);
  });
}

export async function getCycleById(id: string): Promise<Cycle | null> {
  const result = await db.select().from(cycles).where(eq(cycles.id, id)).limit(1);
  return result[0] || null;
}

export async function createCycle(name: string, startDate: string): Promise<Cycle> {
  const newCycle: NewCycle = {
    id: uuidv4(),
    name,
    status: 'active',
    startDate,
    endDate: null,
    createdAt: new Date().toISOString(),
  };

  await db.insert(cycles).values(newCycle);
  return newCycle as Cycle;
}

export async function ensureActiveCycle(): Promise<Cycle> {
  const existing = await getActiveCycle();
  if (existing) {
    return existing;
  }

  // Create initial "Cycle 1"
  const today = new Date().toISOString().split('T')[0];
  return createCycle('Cycle 1', today);
}

export async function archiveCycleAndCreateNew(newCycleName: string): Promise<{ archived: Cycle; new: Cycle }> {
  const activeCycle = await getActiveCycle();
  if (!activeCycle) {
    throw new Error('No active cycle to archive');
  }

  const today = new Date().toISOString().split('T')[0];

  // Update the active cycle to archived
  await db.update(cycles)
    .set({ status: 'archived', endDate: today })
    .where(eq(cycles.id, activeCycle.id));

  // Create new active cycle
  const newCycle = await createCycle(newCycleName, today);

  return {
    archived: { ...activeCycle, status: 'archived', endDate: today },
    new: newCycle,
  };
}

export async function cycleNameExists(name: string): Promise<boolean> {
  const result = await db.select().from(cycles).where(eq(cycles.name, name)).limit(1);
  return result.length > 0;
}
