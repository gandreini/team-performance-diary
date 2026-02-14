---
status: pending
priority: p3
issue_id: "010"
tags: [code-review, quality, simplicity]
dependencies: []
---

# Duplicated Spinner and Sparkle SVG Icons

## Problem Statement

Spinner and sparkle SVG icons are duplicated across `AiTextImprove.tsx`, `MarkdownEditor.tsx`, and `ReportSummary.tsx`. These could be extracted into shared icon components.

## Findings

- **Location:** Multiple component files with identical SVG markup
- Pattern: inline SVGs for loading spinner and AI sparkle icon

## Proposed Solutions

### Option A: Extract to shared icon components
Create `SpinnerIcon` and `SparkleIcon` components in `src/components/icons/`.

**Pros:** DRY, consistent styling
**Cons:** Minor refactor
**Effort:** Small
**Risk:** None

## Acceptance Criteria

- [ ] SVG icons extracted to reusable components
- [ ] All AI components use shared icons
- [ ] Visual appearance unchanged

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-14 | Created from code review | Pattern recognition and simplicity agents flagged |
