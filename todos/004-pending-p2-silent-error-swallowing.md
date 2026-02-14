---
status: pending
priority: p2
issue_id: "004"
tags: [code-review, quality, pattern-recognition]
dependencies: []
---

# Silent Error Swallowing in AI Components

## Problem Statement

The catch blocks in `AiTextImprove.tsx` and `MarkdownEditor.tsx` log errors to console but don't show users any feedback. When AI calls fail, the user sees the loading spinner stop but has no idea what went wrong.

## Findings

- **Location:** `src/components/AiTextImprove.tsx` - catch block sets `isImproving = false` with only `console.error`
- **Location:** `src/components/MarkdownEditor.tsx` - same pattern
- User experience: spinner stops, no error message, no retry guidance

## Proposed Solutions

### Option A: Add toast/inline error messages (Recommended)
Show an inline error message near the AI button when the call fails.

**Pros:** Clear user feedback, simple to implement
**Cons:** Minor UI addition
**Effort:** Small
**Risk:** Low

## Acceptance Criteria

- [ ] Failed AI calls show visible error message to user
- [ ] Error message disappears on retry or after timeout
- [ ] Network errors and API errors both show user-friendly messages

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-14 | Created from code review | Flagged by pattern recognition and architecture agents |
