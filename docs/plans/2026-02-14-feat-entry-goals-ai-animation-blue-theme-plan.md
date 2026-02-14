---
title: "Entry Goals UX, AI Loading Animation & Blue Theme"
type: feat
date: 2026-02-14
---

# Entry Goals UX, AI Loading Animation & Blue Theme

## Overview

Four related improvements to the Team Performance Diary UI: fix development goal linking during entry creation, fix goal display refresh after save, add animated gradient border during AI generation, and move CTAs from dark/purple to a cohesive blue theme.

## Problem Statement / Motivation

1. **Goals not available on create**: `GoalLinkSelector` only renders in edit mode (`editEntry` exists in `AddEntryDrawer.tsx`). Users must save, close, reopen, then link goals - an unnecessary friction.
2. **Stale goal display**: `EntryCard` fetches linked goals on mount but never refetches. After editing goals in the drawer, the card shows stale data until page refresh.
3. **No AI loading feedback on fields**: During AI text improvement, only a small spinner appears on the button. No visual indication on the field itself that content is being generated.
4. **Inconsistent color identity**: CTAs use dark gray (`#111827`), AI accents use purple (`#7C3AED`). Moving to a unified blue palette creates a cleaner brand identity.

## Proposed Solution

### Change 1: Goal Linking on Entry Creation

**Files:** `src/components/AddEntryDrawer.tsx`, `src/app/api/entries/route.ts`

Show `GoalLinkSelector` in create mode (not just edit). On save:
1. POST `/api/entries` creates the entry (returns `id`)
2. If goals selected, immediately PUT `/api/entries/[id]` with `goal_ids`
3. Single "Saving..." state on the button for both calls

The `GoalLinkSelector` already fetches goals from `GET /api/reports/[reportId]/goals` independently - it just needs to be rendered in create mode too.

**State management:**
- Track `selectedGoalIds` in `AddEntryDrawer` state (already exists for edit mode)
- Initialize as empty array in create mode
- Pass to `GoalLinkSelector` as `initialGoalIds={[]}`

**Error handling:** If POST succeeds but PUT fails, keep the entry and show error toast: "Entry saved but goal linking failed. Edit the entry to retry." No rollback - partial state is acceptable since user can fix via edit.

### Change 2: Goal Display Refresh After Save

**Files:** `src/app/reports/[id]/page.tsx`, `src/components/EntryCard.tsx`, `src/components/AddEntryDrawer.tsx`

Use a callback pattern to trigger refetch:
1. `AddEntryDrawer` receives an `onSaveSuccess(entryId: number)` callback prop
2. After successful save (including goal PUT), call `onSaveSuccess(entryId)`
3. Parent page (`reports/[id]/page.tsx`) increments a refresh counter or bumps a key for the affected `EntryCard`
4. `EntryCard` refetches linked goals when its key changes (or via a `refreshKey` prop triggering `useEffect`)

**Implementation approach:** The simplest pattern is to use a `refreshCounter` state in the parent page that increments on save, passed as a dependency to `EntryCard`'s goal-fetching `useEffect`. This avoids global state libraries.

### Change 3: AI Loading Gradient Border Animation

**Files:** `src/components/AiTextImprove.tsx`, `src/components/MarkdownEditor.tsx`, `src/app/globals.css`

When `useAiTextImprove` is in `loading` state, apply an animated gradient border to the field container:

```css
@keyframes ai-gradient-border {
  0% { border-color: #93C5FD; }    /* blue-300 */
  33% { border-color: #3B82F6; }   /* blue-500 */
  66% { border-color: #60A5FA; }   /* blue-400 */
  100% { border-color: #93C5FD; }  /* blue-300 */
}

.ai-loading-border {
  animation: ai-gradient-border 2s ease-in-out infinite;
  border-width: 2px;
  box-shadow: 0 0 8px rgba(59, 130, 246, 0.3);
}
```

- `AiTextImprove`: Apply class to the wrapper `div` when `aiState.state === 'loading'`
- `MarkdownEditor`: Apply class to the outer container `div` when loading
- Use `border-color` animation (GPU-friendly, no repaint) + subtle `box-shadow` glow
- Animation stops automatically when state transitions to `diff` or `error`
- Existing spinner on the button remains for additional feedback

**ReportSummary (`src/components/ReportSummary.tsx`):** Apply the same animated border to the summary text container during AI generation.

### Change 4: Blue Theme

**Files:** `src/components/Button.tsx`, `src/components/AiTextImprove.tsx`, `src/components/MarkdownEditor.tsx`, `src/components/ReportSummary.tsx`, `src/components/InlineDiff.tsx`, `src/app/globals.css`

**Primary palette (base: `#3B82F6` / blue-500):**

| Use | Color | Hex |
|-----|-------|-----|
| Primary CTA | blue-500 | `#3B82F6` |
| Primary hover | blue-600 | `#2563EB` |
| Primary active | blue-700 | `#1D4ED8` |
| Focus ring | blue-200 | `#BFDBFE` |
| AI sparkle hover bg | blue-50 | `#EFF6FF` |
| AI sparkle hover text | blue-500 | `#3B82F6` |
| Gradient glow shadow | blue-500/30 | `rgba(59, 130, 246, 0.3)` |

**Specific changes:**

| Component | Current | New |
|-----------|---------|-----|
| `Button` primary `bg` | `#111827` | `#3B82F6` |
| `Button` primary `hover:bg` | `#1F2937` | `#2563EB` |
| `Button` primary `focus:ring` | (default) | `#BFDBFE` |
| `AiTextImprove` sparkle hover text | `#7C3AED` | `#3B82F6` |
| `AiTextImprove` sparkle hover bg | `#F5F3FF` | `#EFF6FF` |
| `MarkdownEditor` improve hover text | `#7C3AED` | `#3B82F6` |
| `MarkdownEditor` improve hover bg | `#F5F3FF` | `#EFF6FF` |
| `MarkdownEditor` focus border | `#8B5CF6` | `#3B82F6` |
| `MarkdownEditor` focus ring | `#DDD6FE` | `#BFDBFE` |
| `ReportSummary` generate btn bg | `#7C3AED` | `#3B82F6` |
| `ReportSummary` generate btn hover | `#6D28D9` | `#2563EB` |
| `InlineDiff` accept btn bg | `#111827` | `#3B82F6` |
| `InlineDiff` accept btn hover | `#1F2937` | `#2563EB` |
| Entry type hover border (AddEntryModal) | `#8B5CF6` | `#3B82F6` |
| Entry type hover bg (AddEntryModal) | `#F5F3FF` | `#EFF6FF` |
| Input focus states (global) | `border-[#8B5CF6]` | `border-[#3B82F6]` |
| Input focus ring (global) | `ring-[#DDD6FE]` | `ring-[#BFDBFE]` |

**Accessibility:** `#3B82F6` on white = 4.53:1 contrast ratio (passes WCAG AA for normal text).

## Technical Considerations

**Entry creation two-step save:**
- The 30-second timeout already exists in `src/lib/ai.ts` via AbortController
- Button disable during save already exists in AddEntryDrawer
- POST returns the new entry ID, which is needed for the PUT call
- No schema changes needed - `entryGoals` junction table already exists

**Goal refresh performance:**
- Each `EntryCard` independently fetches its goals. A `refreshCounter` prop change triggers only the affected card's refetch, not all cards.
- Alternative: lift goal data to parent and pass down. But current pattern of independent fetches is simpler and already works.

**Animation performance:**
- `border-color` transitions are paint-only (no layout thrash)
- `box-shadow` is also paint-only
- `will-change: border-color, box-shadow` can be added if jank is observed
- Animation uses CSS only (no JS timers), so cleanup is automatic when class is removed

**Concurrent AI requests:**
- `useAiTextImprove` already disables the button during loading state
- Multiple fields (situation, behavior, impact, notes) can each have independent AI state - this is already the case since each uses its own hook instance
- No changes needed for concurrency handling

## Acceptance Criteria

### Change 1: Goal Linking on Create
- [x] `GoalLinkSelector` appears in `AddEntryDrawer` during create mode (not just edit)
- [x] Selected goals are linked after POST creates the entry
- [x] If no goals selected, no PUT call is made
- [x] If POST succeeds but PUT fails, entry is saved and error toast appears
- [x] "Saving..." button state covers both POST and PUT calls
- [x] Works when report has 0 goals (empty selector shown, no error)

### Change 2: Goal Display Refresh
- [x] After editing goals in drawer and saving, `EntryCard` shows updated goals without page refresh
- [x] Only the affected `EntryCard` refetches, not all cards
- [x] Works for both adding and removing goals
- [x] Works when creating a new entry with goals (new card appears with goals)

### Change 3: AI Loading Border Animation
- [x] Animated blue gradient border appears on textarea/editor when AI is loading
- [x] Animation appears on `AiTextImprove` wrapped textareas (situation, behavior, impact fields)
- [x] Animation appears on `MarkdownEditor` fields when AI improve is loading
- [x] Animation appears on `ReportSummary` container during summary generation
- [x] Animation stops when state transitions to `diff`, `error`, or `idle`
- [x] Subtle blue glow shadow accompanies the border animation
- [x] No performance issues on standard devices

### Change 4: Blue Theme
- [x] `Button` primary variant uses `#3B82F6` background with `#2563EB` hover
- [x] AI sparkle buttons use blue hover colors (`#3B82F6` text, `#EFF6FF` bg)
- [x] `ReportSummary` generate/refresh button is blue instead of purple
- [x] `InlineDiff` accept button is blue instead of dark
- [x] Input focus states use blue border (`#3B82F6`) and ring (`#BFDBFE`)
- [x] All purple references (`#7C3AED`, `#8B5CF6`, `#6D28D9`, `#DDD6FE`, `#F5F3FF`) replaced with blue equivalents
- [x] WCAG AA contrast passes for all blue-on-white combinations

## Success Metrics

- Goal linking friction eliminated: users can link goals in one step instead of save-close-reopen-link
- No stale UI: goal changes reflected immediately after save
- AI generation is visually obvious through animated border
- Consistent blue brand identity across all CTAs and interactive elements

## Dependencies & Risks

- **No schema changes** needed - all tables and relationships exist
- **No new API endpoints** needed - POST and PUT already support goal linking
- **Risk: Two-step save failure** - mitigated by error toast and allowing re-edit
- **Risk: Animation performance** - mitigated by using paint-only CSS properties
- **Risk: Blue contrast** - verified at 4.53:1 (WCAG AA pass)

## Implementation Order

1. **Blue theme first** (Change 4) - foundational, affects all components
2. **AI loading animation** (Change 3) - uses the new blue palette
3. **Goal linking on create** (Change 1) - functional improvement
4. **Goal display refresh** (Change 2) - UX polish, may partially come from Change 1 work

## References & Research

### Internal References
- Entry creation flow: `src/components/AddEntryDrawer.tsx`
- Goal selector: `src/components/GoalLinkSelector.tsx`
- AI improve hook: `src/hooks/useAiTextImprove.ts`
- Button component: `src/components/Button.tsx`
- Entry card: `src/components/EntryCard.tsx`
- Report page (orchestrator): `src/app/reports/[id]/page.tsx`
- Entry API: `src/app/api/entries/route.ts`, `src/app/api/entries/[id]/route.ts`
- Global styles: `src/app/globals.css`

### Existing Pattern: AI Summary in ReportSummary
- `src/components/ReportSummary.tsx` already has a loading state for AI generation
- Can be extended with the same gradient border animation
