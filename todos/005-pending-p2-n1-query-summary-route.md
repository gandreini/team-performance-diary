---
status: pending
priority: p2
issue_id: "005"
tags: [code-review, performance]
dependencies: []
---

# N+1 Query in Report Summary POST Route

## Problem Statement

The summary generation POST route calls `getGoalIdsForEntry` once per entry, resulting in N+1 database queries. For reports with many entries, this creates unnecessary DB load.

## Findings

- **Location:** `src/app/api/reports/[id]/summary/route.ts` - POST handler
- Each entry triggers a separate query to fetch linked goal IDs
- Could be batched into a single query for all entries

## Proposed Solutions

### Option A: Batch query all entry-goal links (Recommended)
Fetch all `entryGoalLinks` for the report's entries in a single query, then map in memory.

**Pros:** Reduces N+1 to 2 queries total, simple refactor
**Cons:** Minor code change
**Effort:** Small
**Risk:** Low

## Acceptance Criteria

- [ ] Goal links fetched in a single batch query
- [ ] Same response data, fewer DB queries
- [ ] Existing tests pass

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-14 | Created from code review | Performance agent flagged |
