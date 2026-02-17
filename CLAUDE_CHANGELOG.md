# Changelog

## 2026-02-17

### Fixed
- Feedback form overlap: "Link to Development Goals" no longer overlaps "Additional notes" on narrow screens
- Double scrollbar: re-added body scroll lock when drawer is open to prevent two scrollbars

### Changed
- Drawer: added `footer` prop for sticky bottom content (buttons stay visible while form scrolls)
- Drawer: re-added `document.body.style.overflow = 'hidden'` when open (left column goals still scrollable via internal ScrollArea)
- AddEntryDrawer: Cancel/Save buttons moved to sticky drawer footer via `form="entry-form"` attribute
- EditReportDrawer: Delete/Cancel/Save buttons moved to sticky drawer footer via `form="report-form"` attribute
- AddEntryDrawer: added bottom padding to goal linking section for spacing above sticky footer
- AddEntryDrawer: `flex-1 min-h-0` now conditionally applied — only on non-feedback forms so feedback content scrolls naturally

### Files Modified
- `src/components/Drawer.tsx` - Added `footer` prop, re-added body scroll lock
- `src/components/AddEntryDrawer.tsx` - Moved buttons to footer, conditional flex-1 layout
- `src/components/EditReportDrawer.tsx` - Moved buttons to footer

## 2026-02-14

### Fixed (Code Review)
- Atomic goal linking on entry creation: POST `/api/entries` now accepts `goal_ids` directly, eliminating the fragile two-step POST+PUT pattern in AddEntryDrawer
- CSS variable bug: `--primary-600` was duplicating `--primary-500` (`#3B82F6`), now correctly set to `#2563EB`
- `--primary-700` corrected from `#2563EB` to `#1D4ED8` for proper blue scale progression

### Changed
- AddEntryDrawer sends `goal_ids` in the request body for both create and edit (single request), removing 15 lines of client-side two-step save logic
- AiTextImprove: moved sparkle button outside textarea to top-right bar (matching MarkdownEditor style), added "Improve" label
- AI loading animation: stronger glow (0.45 opacity at peak), faster cycle (1.5s), animated box-shadow, child textarea border hidden during loading
- `.ai-loading-border > textarea` rule hides textarea's own border to prevent double-border detachment

### Files Modified
- `src/app/api/entries/route.ts` - Import `linkEntryToGoals`, call after entry creation
- `src/components/AddEntryDrawer.tsx` - Simplified save: always include `goal_ids` in body
- `src/components/AiTextImprove.tsx` - Button moved outside field, loading border wraps children properly
- `src/app/globals.css` - Fixed CSS vars, enhanced AI animation, added `.ai-loading-border > textarea` rule

## 2026-01-12

### Added
- Initial application setup with Next.js 16 and React 19
- Database schema with Drizzle ORM (cycles, reports, entries)
- API routes for cycles, reports, entries, and backup
- UI components: Modal, Drawer, Button, Toast, Header
- Report and entry management pages
- Markdown editor for entries
- Cycle archiving functionality
- Backup/restore feature in settings
- Basic auth middleware for access protection
- Turso database support for production
- ScrollArea component with custom scrollbar styling
- Two-column layout for report detail page on wide screens (xl+)
- Sticky sidebar for development goals on wide screens
- Title field (optional) for accomplishment entries
- Feedback given checkbox for feedback entries
- Comprehensive test suite with Vitest (107 tests)
  - Library function tests: entries, cycles, reports
  - API route tests: entries, cycles, reports endpoints
- User icon to report cards
- Responsive grid layout for report cards on home page

### Changed
- Page max-width increased to 1800px for wide monitors
- Badge colors: Positive/Kudos now green, Constructive now red
- Development goals section has scrollable content area
- Badge labels: "Positive" → "Positive Feedback", "Constructive" → "Constructive Feedback"
- Markdown editor fields now fill available vertical space in drawers
- Report cards changed from row layout to rectangular cards with icons

### Files
- `src/app/` - All pages and API routes
- `src/components/` - UI components
- `src/components/ScrollArea.tsx` - Custom scrollbar component
- `src/components/MarkdownEditor.tsx` - Added fillHeight prop
- `src/components/ReportCard.tsx` - Rectangular card with user icon
- `src/components/EntryBadge.tsx` - Updated badge labels
- `src/db/` - Database schema and connection
- `src/lib/` - Business logic
- `src/middleware.ts` - Basic auth protection
- `drizzle.config.ts` - Database configuration
- `src/app/globals.css` - Custom scrollbar styles
- `vitest.config.ts` - Test configuration
- `src/test/setup.ts` - Test setup with db mocks
- `src/lib/__tests__/` - Library function tests
- `src/app/api/*/__tests__/` - API route tests
- `tsconfig.json` - Excludes test files from build
