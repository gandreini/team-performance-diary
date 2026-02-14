---
title: "Drizzle ORM Index Defined in Schema But Not Applied to Database"
category: database-issues
tags:
  - drizzle-orm
  - sqlite
  - schema-mismatch
  - upsert
  - unique-constraint
  - code-review
module: report-summaries
severity: high
date_solved: 2026-02-14
symptoms:
  - "SQL upsert (onConflictDoUpdate) fails at runtime"
  - "drizzle-kit push fails with 'index already exists' error"
  - "Schema code and actual database are out of sync"
---

# Drizzle ORM Index Defined in Schema But Not Applied to Database

## Problem

After adding a unique composite index to the `reportSummaries` table in Drizzle schema code, the `onConflictDoUpdate` upsert started failing at runtime:

```
Failed query: insert into "report_summaries" ("id", "report_id", "cycle_id", "content", ...)
on conflict ("report_summaries"."report_id", "report_summaries"."cycle_id")
do update set "content" = ?, ...
```

The upsert requires the unique index to exist in the actual database, but it only existed in `schema.ts`.

## Investigation

1. The schema code in `src/db/schema.ts` correctly defined the index:
   ```typescript
   export const reportSummaries = sqliteTable('report_summaries', {
     // ... columns ...
   }, (table) => [
     uniqueIndex('report_summaries_report_cycle_idx').on(table.reportId, table.cycleId),
   ]);
   ```

2. Running `npm run db:push` (drizzle-kit push) failed with:
   ```
   LibsqlError: SQLITE_ERROR: index cycles_name_unique already exists
   ```

3. This error on an **unrelated table** (`cycles`) blocked ALL schema changes from applying, including the new index on `report_summaries`.

## Root Cause

Two compounding issues:

1. **Schema-database drift**: The index was added to schema code but `db:push` was never successfully run to apply it.
2. **Silent total failure**: `drizzle-kit push` fails entirely when it encounters ANY conflict, even on unrelated tables. This means all pending changes are silently dropped.

## Solution

Created a one-off script to apply the missing index directly:

```typescript
// src/db/add-index.ts (temporary)
import { createClient } from '@libsql/client';

const client = createClient({ url: 'file:local.db' });

async function run() {
  const result = await client.execute(
    "SELECT name FROM sqlite_master WHERE type='index' AND name='report_summaries_report_cycle_idx'"
  );
  if (result.rows.length === 0) {
    await client.execute(
      'CREATE UNIQUE INDEX report_summaries_report_cycle_idx ON report_summaries (report_id, cycle_id)'
    );
    console.log('Index created');
  } else {
    console.log('Index already exists');
  }
}

run().catch(console.error);
```

Run with: `npx tsx src/db/add-index.ts`

## Prevention

1. **Always verify `db:push` succeeds** after modifying `schema.ts`. Check the output for errors.
2. **After adding upsert logic with `onConflictDoUpdate`**, confirm the target unique index exists in the actual database, not just in code.
3. **If `db:push` fails**, don't ignore it. Fix the blocking issue first, then re-run to apply all pending changes.
4. **Verify indexes exist** by querying SQLite directly:
   ```sql
   SELECT name FROM sqlite_master WHERE type='index' AND tbl_name='report_summaries';
   ```

## Key Takeaway

Drizzle ORM schema code is declarative - it describes the desired state but doesn't automatically apply it. The `db:push` command bridges the gap, but if it fails for any reason, your schema code and database silently diverge. Always treat `db:push` failures as blocking issues.
