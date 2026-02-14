---
status: pending
priority: p2
issue_id: "003"
tags: [code-review, data-integrity]
dependencies: ["001"]
---

# Upsert Race Condition in saveReportSummary

## Problem Statement

`saveReportSummary` performs a SELECT followed by INSERT or UPDATE as separate operations. Between the SELECT and INSERT, another request could insert a row, causing either a duplicate or a lost update. This is closely related to #001 (unique constraint) — fixing #001 with `onConflictDoUpdate` would resolve this automatically.

## Findings

- **Location:** `src/lib/report-summaries.ts:saveReportSummary()`
- Window between SELECT and INSERT is small but real under concurrent load
- If #001 is resolved with `onConflictDoUpdate`, this issue is automatically fixed

## Proposed Solutions

### Option A: Resolve via #001 (Recommended)
Adding unique constraint + `onConflictDoUpdate` eliminates the race condition entirely.

**Pros:** Atomic, clean, no separate fix needed
**Cons:** Depends on #001
**Effort:** None (part of #001)
**Risk:** Low

## Acceptance Criteria

- [ ] `saveReportSummary` uses a single atomic upsert operation
- [ ] No race condition window between check and write

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-14 | Created from code review | Blocked by #001 |
