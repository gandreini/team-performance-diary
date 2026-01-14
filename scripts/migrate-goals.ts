// Migration script to add structured goals tables
import { db } from '../src/db';
import { sql } from 'drizzle-orm';

async function migrate() {
  console.log('Running migration for structured goals...');

  // Add development_goals table
  await db.run(sql`
    CREATE TABLE IF NOT EXISTS development_goals (
      id text PRIMARY KEY NOT NULL,
      report_id text NOT NULL,
      title text NOT NULL,
      description text,
      sort_order integer DEFAULT 0 NOT NULL,
      created_at text NOT NULL,
      updated_at text NOT NULL,
      FOREIGN KEY (report_id) REFERENCES reports(id) ON UPDATE no action ON DELETE cascade
    )
  `);
  console.log('Created development_goals table');

  // Add entry_goals junction table
  await db.run(sql`
    CREATE TABLE IF NOT EXISTS entry_goals (
      id text PRIMARY KEY NOT NULL,
      entry_id text NOT NULL,
      goal_id text NOT NULL,
      created_at text NOT NULL,
      FOREIGN KEY (entry_id) REFERENCES entries(id) ON UPDATE no action ON DELETE cascade,
      FOREIGN KEY (goal_id) REFERENCES development_goals(id) ON UPDATE no action ON DELETE cascade
    )
  `);
  console.log('Created entry_goals table');

  // Check if goals_snapshot column exists
  try {
    await db.run(sql`ALTER TABLE archived_goals ADD COLUMN goals_snapshot text`);
    console.log('Added goals_snapshot column to archived_goals');
  } catch (e: unknown) {
    const error = e as Error;
    if (error.message?.includes('duplicate column name')) {
      console.log('goals_snapshot column already exists');
    } else {
      throw e;
    }
  }

  console.log('Migration completed successfully!');
}

migrate().catch(console.error);
