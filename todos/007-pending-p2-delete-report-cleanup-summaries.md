---
status: pending
priority: p2
issue_id: "007"
tags: [code-review, data-integrity]
dependencies: []
---

# deleteReport Doesn't Clean Up reportSummaries

## Problem Statement

`deleteReport` in `src/lib/reports.ts` deletes entries and the report but doesn't explicitly delete associated `reportSummaries` rows. SQLite FK enforcement with cascade delete depends on `PRAGMA foreign_keys = ON`, which may not be set.

## Findings

- **Location:** `src/lib/reports.ts:deleteReport()`
- **Location:** `src/db/schema.ts` - reportSummaries FK references
- SQLite requires explicit `PRAGMA foreign_keys = ON` per connection for cascades
- Turso/libSQL may or may not enable this by default

## Proposed Solutions

### Option A: Explicitly delete reportSummaries in deleteReport (Recommended)
Add `db.delete(reportSummaries).where(eq(reportSummaries.reportId, id))` before deleting the report.

**Pros:** Works regardless of FK pragma setting, explicit is better than implicit
**Cons:** One extra line of code
**Effort:** Trivial
**Risk:** Low

## Acceptance Criteria

- [ ] `deleteReport` explicitly deletes associated reportSummaries
- [ ] Test verifies cleanup happens

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-14 | Created from code review | Data integrity agent flagged |
