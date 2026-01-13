# Changelog

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
