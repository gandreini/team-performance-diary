---
status: pending
priority: p1
issue_id: "001"
tags: [code-review, data-integrity, architecture]
dependencies: []
---

# Missing Unique Constraint on reportSummaries(reportId, cycleId)

## Problem Statement

The `reportSummaries` table lacks a unique composite constraint on `(reportId, cycleId)`. The upsert logic in `saveReportSummary` does a SELECT then INSERT/UPDATE, but without a DB-level constraint, concurrent requests can create duplicate rows. This was flagged by 3 independent review agents (data integrity, architecture, performance).

## Findings

- **Location:** `src/db/schema.ts` - `reportSummaries` table definition
- **Location:** `src/lib/report-summaries.ts:saveReportSummary()` - application-level upsert
- Drizzle ORM supports `.unique()` on composite columns or unique indexes
- Without constraint, the upsert race window allows duplicates

## Proposed Solutions

### Option A: Add unique composite index (Recommended)
Add a unique index on `(reportId, cycleId)` in the schema and use Drizzle's `onConflictDoUpdate`.

**Pros:** Eliminates race condition at DB level, simplifies upsert logic
**Cons:** Requires `db:push` or migration
**Effort:** Small
**Risk:** Low

### Option B: Application-level locking
Use a mutex/lock pattern in the API route.

**Pros:** No schema change needed
**Cons:** Doesn't protect against multi-instance deployments, more complex
**Effort:** Medium
**Risk:** Medium

## Acceptance Criteria

- [ ] Unique composite index exists on `reportSummaries(reportId, cycleId)`
- [ ] `saveReportSummary` uses `onConflictDoUpdate` instead of SELECT+INSERT/UPDATE
- [ ] Tests verify duplicate insert is handled gracefully
- [ ] `db:push` runs successfully

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-14 | Created from code review | Flagged by 3 agents independently |
