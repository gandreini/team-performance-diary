import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

// Cycles table
export const cycles = sqliteTable('cycles', {
  id: text('id').primaryKey(),
  name: text('name').notNull().unique(),
  status: text('status', { enum: ['active', 'archived'] }).notNull(),
  startDate: text('start_date').notNull(),
  endDate: text('end_date'),
  createdAt: text('created_at').notNull().default(new Date().toISOString()),
});

// Reports table
export const reports = sqliteTable('reports', {
  id: text('id').primaryKey(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  developmentGoals: text('development_goals'),
  createdAt: text('created_at').notNull().default(new Date().toISOString()),
  updatedAt: text('updated_at').notNull().default(new Date().toISOString()),
});

// Development goals table (structured goals per report)
export const developmentGoals = sqliteTable('development_goals', {
  id: text('id').primaryKey(),
  reportId: text('report_id').notNull().references(() => reports.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: text('created_at').notNull().default(new Date().toISOString()),
  updatedAt: text('updated_at').notNull().default(new Date().toISOString()),
});

// Archived goals table (snapshot when cycle is archived)
export const archivedGoals = sqliteTable('archived_goals', {
  id: text('id').primaryKey(),
  reportId: text('report_id').notNull().references(() => reports.id, { onDelete: 'cascade' }),
  cycleId: text('cycle_id').notNull().references(() => cycles.id, { onDelete: 'cascade' }),
  developmentGoals: text('development_goals'), // Legacy field - kept for migration
  goalsSnapshot: text('goals_snapshot'), // JSON array of structured goals
  createdAt: text('created_at').notNull().default(new Date().toISOString()),
});

// Entry-goal junction table (links entries to development goals)
export const entryGoals = sqliteTable('entry_goals', {
  id: text('id').primaryKey(),
  entryId: text('entry_id').notNull().references(() => entries.id, { onDelete: 'cascade' }),
  goalId: text('goal_id').notNull().references(() => developmentGoals.id, { onDelete: 'cascade' }),
  createdAt: text('created_at').notNull().default(new Date().toISOString()),
});

// Report summaries table (AI-generated, per report per cycle)
export const reportSummaries = sqliteTable('report_summaries', {
  id: text('id').primaryKey(),
  reportId: text('report_id').notNull().references(() => reports.id, { onDelete: 'cascade' }),
  cycleId: text('cycle_id').notNull().references(() => cycles.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  generatedAt: text('generated_at').notNull(),
  createdAt: text('created_at').notNull().default(new Date().toISOString()),
  updatedAt: text('updated_at').notNull().default(new Date().toISOString()),
});

// Entries table
export const entries = sqliteTable('entries', {
  id: text('id').primaryKey(),
  reportId: text('report_id').notNull().references(() => reports.id, { onDelete: 'cascade' }),
  cycleId: text('cycle_id').notNull().references(() => cycles.id, { onDelete: 'cascade' }),
  entryType: text('entry_type', {
    enum: ['feedback', 'accomplishment', 'kudos', 'notes', 'career_conversation', 'third_party_feedback']
  }).notNull(),
  createdAt: text('created_at').notNull().default(new Date().toISOString()),
  updatedAt: text('updated_at').notNull().default(new Date().toISOString()),

  // Feedback-specific fields
  feedbackType: text('feedback_type', { enum: ['positive', 'constructive'] }),
  feedbackGiven: integer('feedback_given', { mode: 'boolean' }).default(false),
  situation: text('situation'),
  behavior: text('behavior'),
  impact: text('impact'),

  // Shared fields
  title: text('title'),
  notes: text('notes'),
  link: text('link'),
  providerName: text('provider_name'),
});

// Types
export type Cycle = typeof cycles.$inferSelect;
export type NewCycle = typeof cycles.$inferInsert;

export type Report = typeof reports.$inferSelect;
export type NewReport = typeof reports.$inferInsert;

export type ArchivedGoal = typeof archivedGoals.$inferSelect;
export type NewArchivedGoal = typeof archivedGoals.$inferInsert;

export type DevelopmentGoal = typeof developmentGoals.$inferSelect;
export type NewDevelopmentGoal = typeof developmentGoals.$inferInsert;

export type EntryGoal = typeof entryGoals.$inferSelect;
export type NewEntryGoal = typeof entryGoals.$inferInsert;

export type ReportSummary = typeof reportSummaries.$inferSelect;
export type NewReportSummary = typeof reportSummaries.$inferInsert;

export type Entry = typeof entries.$inferSelect;
export type NewEntry = typeof entries.$inferInsert;

export type EntryType = 'feedback' | 'accomplishment' | 'kudos' | 'notes' | 'career_conversation' | 'third_party_feedback';
export type FeedbackType = 'positive' | 'constructive';
export type CycleStatus = 'active' | 'archived';

// For archived goals snapshot
export interface ArchivedGoalSnapshot {
  id: string;
  title: string;
  description: string | null;
  sortOrder: number;
}
