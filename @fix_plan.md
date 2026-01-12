# Ralph Fix Plan - Team Performance Diary

## High Priority

### Phase 1: Project Setup
- [x] Initialize Next.js project with App Router
- [x] Configure Tailwind CSS
- [x] Set up Turso/SQLite with Drizzle ORM
- [x] Create database schema (cycles, reports, archived_goals, entries tables)
- [x] Run initial database migrations
- [x] Create base layout with header navigation

### Phase 2: Cycle Management
- [x] Implement auto-create initial cycle logic (on first app access)
- [x] Create Settings page with current cycle info display
- [x] Build archive cycle modal with validation
- [x] Implement cycle archiving API (archive active, create new, copy goals)
- [x] Create archived cycles list on Settings page
- [x] Build archived cycle detail view (read-only entries and goals)

### Phase 3: Report Management
- [x] Create home page with reports list (sorted alphabetically)
- [x] Show entry count per report for current cycle
- [x] Build Add Report modal with validation
- [x] Build Edit Report modal
- [x] Implement Delete Report with confirmation and cascade delete
- [x] Create report diary page layout

## Medium Priority

### Phase 4: Entry Management - Core
- [x] Build entry type selection interface (6 types)
- [x] Implement Feedback entry form (SBI framework + notes)
- [x] Implement Accomplishment entry form
- [x] Implement Kudos entry form (with optional link)
- [x] Implement Notes entry form
- [x] Implement Career Conversation entry form
- [x] Implement Third-Party Feedback entry form (with provider name)

### Phase 5: Entry Features
- [x] Create entry cards with type-specific display
- [x] Implement entry type badge colors
- [x] Build entry filter by type
- [x] Implement entry edit functionality
- [x] Implement entry delete with confirmation modal
- [x] Add markdown rendering for notes/goals (react-markdown)

### Phase 6: Development Goals
- [x] Display development goals section on diary page
- [x] Implement inline edit for development goals
- [x] Add markdown rendering for goals
- [x] Show archived goals in archived cycle view

## Low Priority

### Phase 7: UI Polish
- [x] Implement toast notifications for all actions
- [x] Add loading states to save buttons
- [x] Implement unsaved changes warning
- [x] Add empty states with helpful messages
- [ ] Ensure responsive layout (768px minimum)
- [ ] Verify touch targets are 44x44px minimum

### Phase 8: Error Handling & Data Integrity
- [x] Implement network error handling with user-friendly messages
- [x] Add form validation error messages
- [x] Prevent double submission during saves
- [ ] Add optimistic UI updates where appropriate

## Completed
- [x] Project initialization
- [x] Ralph configuration files created
- [x] Next.js 16 with App Router configured
- [x] Drizzle ORM with SQLite (Turso) set up
- [x] All database tables created (cycles, reports, archived_goals, entries)
- [x] All API endpoints implemented
- [x] Home page with reports list
- [x] Report diary page with entries and goals
- [x] Settings page with cycle management
- [x] Archived cycle view
- [x] All 6 entry types with forms
- [x] Toast notifications
- [x] Modal components
- [x] Form validation

## Notes

### Entry Type Badge Colors
- Feedback: Blue (Positive) / Amber (Constructive)
- Accomplishment: Green
- Kudos: Yellow
- Notes: Gray
- Career Conversation: Purple
- Third-Party Feedback: Orange

### Validation Limits
- Names: 1-50 chars, trimmed
- Development goals: max 5000 chars
- Entry notes: max 5000 chars (2000 for feedback additional notes)
- SBI fields: 1-1000 chars each
- Links: valid http(s) URL, max 500 chars
- Provider name: 1-100 chars, trimmed
- Cycle name: 1-50 chars, unique

### Database Tables
1. `cycles` - id, name, status (active/archived), start_date, end_date, created_at
2. `reports` - id, first_name, last_name, development_goals, created_at, updated_at
3. `archived_goals` - id, report_id, cycle_id, development_goals, created_at
4. `entries` - id, report_id, cycle_id, entry_type, created_at, updated_at, feedback_type, situation, behavior, impact, notes, link, provider_name

### Key Business Rules
- Only one active cycle at a time
- Archiving copies development_goals to archived_goals, then clears them
- Entries are filtered by current cycle unless viewing archived cycle
- Report deletion cascades to entries and archived_goals

### Files Created
- `/src/db/schema.ts` - Database schema
- `/src/db/index.ts` - Database client
- `/src/lib/cycles.ts` - Cycle operations
- `/src/lib/reports.ts` - Report operations
- `/src/lib/entries.ts` - Entry operations
- `/src/lib/archived-goals.ts` - Archived goals operations
- `/src/components/Header.tsx` - Navigation header
- `/src/components/Toast.tsx` - Toast notifications
- `/src/components/Modal.tsx` - Modal dialog
- `/src/components/Button.tsx` - Button component
- `/src/components/ReportCard.tsx` - Report list card
- `/src/components/AddReportModal.tsx` - Add report form
- `/src/components/EditReportModal.tsx` - Edit/delete report
- `/src/components/EntryBadge.tsx` - Entry type badges
- `/src/components/EntryCard.tsx` - Entry display card
- `/src/components/AddEntryModal.tsx` - Add/edit entry forms
- `/src/app/page.tsx` - Home page (reports list)
- `/src/app/settings/page.tsx` - Settings page
- `/src/app/reports/[id]/page.tsx` - Report diary page
- `/src/app/cycles/[id]/page.tsx` - Archived cycle view
- All API routes under `/src/app/api/`
