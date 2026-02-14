---
status: pending
priority: p2
issue_id: "002"
tags: [code-review, architecture, pattern-recognition, simplicity]
dependencies: []
---

# Extract Shared AI State Logic into useAiTextImprove Hook

## Problem Statement

`AiTextImprove.tsx` and `MarkdownEditor.tsx` both implement nearly identical AI improvement state management: loading state, error handling, fetching from `/api/ai/improve-text`, and diff display logic. This duplication increases maintenance burden and risks divergent behavior. Flagged by 3 agents (pattern recognition, architecture, simplicity).

## Findings

- **Location:** `src/components/AiTextImprove.tsx` - standalone AI wrapper
- **Location:** `src/components/MarkdownEditor.tsx` - embedded AI feature
- Both components: manage `isImproving` state, call same API, handle errors identically
- Estimated ~60 lines of duplicated logic

## Proposed Solutions

### Option A: Extract `useAiTextImprove` custom hook (Recommended)
Create `src/hooks/useAiTextImprove.ts` with shared state and fetch logic.

**Pros:** Single source of truth, DRY, easy to test independently
**Cons:** Slight refactor of both components
**Effort:** Small
**Risk:** Low

### Option B: Make AiTextImprove the sole component
Remove inline AI from MarkdownEditor, always use AiTextImprove wrapper.

**Pros:** Single implementation
**Cons:** May not fit all UI layouts, MarkdownEditor's inline UX is different
**Effort:** Medium
**Risk:** Medium

## Acceptance Criteria

- [ ] Custom hook `useAiTextImprove` exists with shared logic
- [ ] Both components use the hook instead of duplicated code
- [ ] Existing tests still pass
- [ ] No behavior changes in either component

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-14 | Created from code review | 3 agents flagged same duplication |
