# Product Requirements Document: Team Performance Diary

## Overview

A personal web application for design team leads to track performance-related information about their direct reports throughout review cycles. The app serves as a structured diary, capturing feedback, accomplishments, kudos, notes, career conversations, and third-party feedback—all organized chronologically and filterable by type.

At cycle end, the lead can archive all entries and development goals, then start a fresh cycle while retaining access to historical data.

## Problem Statement

During a review cycle (typically a semester), team leads accumulate scattered notes about their reports: feedback given, accomplishments observed, kudos received, career conversations held, and third-party input collected. This information lives in various places—Slack, docs, memory—making it difficult to write accurate, evidence-based performance reviews.

## Users

Single user: the design team lead. No multi-user or authentication required.

## Technical Stack

- **Framework**: Next.js (App Router)
- **Database**: SQLite via Turso
- **ORM**: Drizzle ORM
- **Styling**: Tailwind CSS
- **Deployment**: Vercel (Hobby tier)
- **Markdown**: react-markdown for rendering

---

# User Stories

## Epic 1: Cycle Management

### US-1.1: Create Initial Cycle

**As a** team lead  
**I want to** have an active cycle created automatically when I first use the app  
**So that** I can immediately start adding reports and entries without setup friction

#### Acceptance Criteria

| ID | Criterion | Validation |
|----|-----------|------------|
| AC-1.1.1 | When the app is accessed for the first time and no cycles exist in the database, a new cycle is created automatically | Query `cycles` table; if `COUNT(*) = 0`, create new cycle |
| AC-1.1.2 | The auto-created cycle has name "Cycle 1" | `cycle.name === "Cycle 1"` |
| AC-1.1.3 | The auto-created cycle has status "active" | `cycle.status === "active"` |
| AC-1.1.4 | The auto-created cycle has start_date set to today | `cycle.start_date === new Date().toISOString().split('T')[0]` |
| AC-1.1.5 | The auto-created cycle has end_date set to null | `cycle.end_date === null` |
| AC-1.1.6 | After auto-creation, exactly one cycle exists with status "active" | `SELECT COUNT(*) FROM cycles WHERE status = 'active'` returns 1 |

---

### US-1.2: View Current Cycle Information

**As a** team lead  
**I want to** see information about the current active cycle  
**So that** I know what time period I'm tracking

#### Acceptance Criteria

| ID | Criterion | Validation |
|----|-----------|------------|
| AC-1.2.1 | The Settings page displays the active cycle's name | UI shows `cycle.name` where `cycle.status === "active"` |
| AC-1.2.2 | The Settings page displays the active cycle's start date in format "MMM D, YYYY" | Date formatted correctly (e.g., "Jan 15, 2025") |
| AC-1.2.3 | The Settings page displays the active cycle's status as "Active" | UI shows "Active" badge/label |
| AC-1.2.4 | If no active cycle exists, the app shows an error state with option to create one | Error message displayed; "Create Cycle" button visible |

---

### US-1.3: Archive Current Cycle and Start New Cycle

**As a** team lead  
**I want to** archive the current cycle and start a new one  
**So that** I can begin a fresh review period while preserving historical data

#### Acceptance Criteria

| ID | Criterion | Validation |
|----|-----------|------------|
| AC-1.3.1 | Settings page shows "Archive & Start New Cycle" button | Button is visible and enabled when active cycle exists |
| AC-1.3.2 | Clicking the button opens a confirmation modal | Modal element appears with `role="dialog"` |
| AC-1.3.3 | Modal displays warning: "This will archive all current entries and development goals. This action cannot be undone." | Exact text present in modal |
| AC-1.3.4 | Modal has input field for new cycle name | Input field with label "New cycle name" exists |
| AC-1.3.5 | New cycle name input is required | Form does not submit if input is empty; validation message shown |
| AC-1.3.6 | New cycle name must be 1-50 characters | Validation error if `name.length < 1 \|\| name.length > 50` |
| AC-1.3.7 | New cycle name must be unique across all cycles | Validation error if `SELECT COUNT(*) FROM cycles WHERE name = :input` > 0 |
| AC-1.3.8 | Modal has "Cancel" button that closes modal without changes | Clicking Cancel closes modal; no database changes |
| AC-1.3.9 | Modal has "Archive & Start New" button | Button visible in modal |
| AC-1.3.10 | On confirm, previous cycle status changes to "archived" | `UPDATE cycles SET status = 'archived' WHERE status = 'active'` |
| AC-1.3.11 | On confirm, previous cycle end_date is set to today | `previous_cycle.end_date === new Date().toISOString().split('T')[0]` |
| AC-1.3.12 | On confirm, new cycle is created with status "active" | New row in `cycles` with `status = 'active'` |
| AC-1.3.13 | On confirm, new cycle has start_date set to today | `new_cycle.start_date === new Date().toISOString().split('T')[0]` |
| AC-1.3.14 | On confirm, new cycle has the user-provided name | `new_cycle.name === userInput` |
| AC-1.3.15 | On confirm, each report's current development_goals are copied to archived_goals table | For each report: `INSERT INTO archived_goals (report_id, cycle_id, development_goals)` with archived cycle's ID |
| AC-1.3.16 | On confirm, each report's development_goals field is cleared | `UPDATE reports SET development_goals = NULL` |
| AC-1.3.17 | After archiving, exactly one cycle has status "active" | `SELECT COUNT(*) FROM cycles WHERE status = 'active'` returns 1 |
| AC-1.3.18 | User sees success message: "Cycle archived successfully. New cycle '[name]' is now active." | Toast/notification with exact text (name interpolated) |
| AC-1.3.19 | Modal closes after successful operation | Modal element no longer in DOM |
| AC-1.3.20 | If database operation fails, modal shows error message and remains open | Error message displayed; modal stays open; no partial changes persisted |

---

### US-1.4: View Archived Cycles List

**As a** team lead  
**I want to** see a list of all archived cycles  
**So that** I can access historical data from past review periods

#### Acceptance Criteria

| ID | Criterion | Validation |
|----|-----------|------------|
| AC-1.4.1 | Settings page shows "Archived Cycles" section | Section heading "Archived Cycles" visible |
| AC-1.4.2 | Each archived cycle displays its name | `cycle.name` shown for each cycle where `status === "archived"` |
| AC-1.4.3 | Each archived cycle displays date range in format "MMM D, YYYY – MMM D, YYYY" | `start_date` and `end_date` formatted and shown |
| AC-1.4.4 | Archived cycles are sorted by end_date descending (most recent first) | `ORDER BY end_date DESC` |
| AC-1.4.5 | Each archived cycle is clickable/tappable | Cursor pointer; click handler attached |
| AC-1.4.6 | If no archived cycles exist, show message "No archived cycles yet" | Message visible when `SELECT COUNT(*) FROM cycles WHERE status = 'archived'` = 0 |

---

### US-1.5: View Archived Cycle Details

**As a** team lead  
**I want to** view entries and goals from an archived cycle  
**So that** I can reference historical performance data

#### Acceptance Criteria

| ID | Criterion | Validation |
|----|-----------|------------|
| AC-1.5.1 | Clicking an archived cycle navigates to archived cycle view | URL changes to `/cycles/[cycleId]` |
| AC-1.5.2 | Page displays "Archived" badge prominently | Badge with text "Archived" visible in header |
| AC-1.5.3 | Page displays cycle name and date range | Name and "MMM D, YYYY – MMM D, YYYY" format shown |
| AC-1.5.4 | Page shows list of all reports that have entries in this cycle | Reports listed if `SELECT DISTINCT report_id FROM entries WHERE cycle_id = :cycleId` |
| AC-1.5.5 | Selecting a report shows their archived development goals | Goals fetched from `archived_goals` where `report_id` and `cycle_id` match |
| AC-1.5.6 | Selecting a report shows their entries from that cycle | Entries fetched where `report_id` and `cycle_id` match |
| AC-1.5.7 | Entries are displayed in reverse chronological order | `ORDER BY created_at DESC` |
| AC-1.5.8 | All entry data is read-only (no edit/delete buttons) | Edit and delete buttons not rendered |
| AC-1.5.9 | Development goals are read-only (no edit button) | Edit button not rendered |
| AC-1.5.10 | Back button returns to Settings page | Click navigates to `/settings` |

---

## Epic 2: Report Management

### US-2.1: View All Reports

**As a** team lead  
**I want to** see a list of all my direct reports  
**So that** I can select one to view or add entries

#### Acceptance Criteria

| ID | Criterion | Validation |
|----|-----------|------------|
| AC-2.1.1 | Home page displays all reports from the database | All rows from `reports` table displayed |
| AC-2.1.2 | Each report card shows full name as "First Last" | `${report.first_name} ${report.last_name}` displayed |
| AC-2.1.3 | Each report card shows count of entries in current cycle | Count from `SELECT COUNT(*) FROM entries WHERE report_id = :id AND cycle_id = :activeCycleId` |
| AC-2.1.4 | Entry count label is "[n] entries" (plural) when n ≠ 1 | "0 entries", "2 entries", "15 entries" |
| AC-2.1.5 | Entry count label is "1 entry" (singular) when n = 1 | Exact text "1 entry" |
| AC-2.1.6 | Reports are sorted alphabetically by first name, then last name | `ORDER BY first_name ASC, last_name ASC` |
| AC-2.1.7 | Each report card is clickable | Cursor pointer; click handler attached |
| AC-2.1.8 | Clicking a report card navigates to that report's diary page | URL changes to `/reports/[reportId]` |
| AC-2.1.9 | If no reports exist, show empty state with message "No reports yet. Add your first report to get started." | Message visible when `reports` table is empty |
| AC-2.1.10 | Empty state includes "Add Report" button | Button visible in empty state |

---

### US-2.2: Add a New Report

**As a** team lead  
**I want to** add a new direct report to the system  
**So that** I can start tracking their performance

#### Acceptance Criteria

| ID | Criterion | Validation |
|----|-----------|------------|
| AC-2.2.1 | Home page shows "Add Report" button | Button visible with text "Add Report" |
| AC-2.2.2 | Clicking "Add Report" opens a modal form | Modal element appears with `role="dialog"` |
| AC-2.2.3 | Modal title is "Add Report" | Heading with exact text present |
| AC-2.2.4 | Form has "First name" input field | Input with label "First name" exists |
| AC-2.2.5 | First name is required | Form does not submit if empty; validation message "First name is required" shown |
| AC-2.2.6 | First name must be 1-50 characters | Validation error "First name must be between 1 and 50 characters" if out of range |
| AC-2.2.7 | First name is trimmed of leading/trailing whitespace before validation and storage | `" John ".trim() === "John"` |
| AC-2.2.8 | Form has "Last name" input field | Input with label "Last name" exists |
| AC-2.2.9 | Last name is required | Form does not submit if empty; validation message "Last name is required" shown |
| AC-2.2.10 | Last name must be 1-50 characters | Validation error "Last name must be between 1 and 50 characters" if out of range |
| AC-2.2.11 | Last name is trimmed of leading/trailing whitespace before validation and storage | `" Doe ".trim() === "Doe"` |
| AC-2.2.12 | Form has "Development goals" textarea (optional) | Textarea with label "Development goals (optional)" exists |
| AC-2.2.13 | Development goals field accepts markdown | Field accepts any text including markdown syntax |
| AC-2.2.14 | Development goals has max length of 5000 characters | Validation error if `goals.length > 5000`; character count shown |
| AC-2.2.15 | Form has "Cancel" button | Button with text "Cancel" present |
| AC-2.2.16 | Clicking Cancel closes modal without saving | Modal closes; no new row in `reports` table |
| AC-2.2.17 | Form has "Save" button | Button with text "Save" present |
| AC-2.2.18 | Save button is disabled while form is invalid | Button has `disabled` attribute when validation fails |
| AC-2.2.19 | On save, new report is created in database | New row in `reports` table with provided values |
| AC-2.2.20 | On save, report ID is a valid UUID | `report.id` matches UUID v4 format |
| AC-2.2.21 | On save, created_at is set to current timestamp | `report.created_at` is within 1 second of now |
| AC-2.2.22 | On save, updated_at is set to current timestamp | `report.updated_at` is within 1 second of now |
| AC-2.2.23 | On save, modal closes | Modal element no longer in DOM |
| AC-2.2.24 | On save, report list updates to include new report | New report card visible in list |
| AC-2.2.25 | On save, success message shown: "Report added successfully" | Toast/notification with exact text |
| AC-2.2.26 | If save fails, error message shown and modal stays open | Error message displayed; modal remains open |

---

### US-2.3: Edit Report Details

**As a** team lead  
**I want to** edit a report's name or development goals  
**So that** I can fix mistakes or update goals during the cycle

#### Acceptance Criteria

| ID | Criterion | Validation |
|----|-----------|------------|
| AC-2.3.1 | Report diary page shows "Edit Report" button in header | Button visible with text "Edit Report" or edit icon with accessible label |
| AC-2.3.2 | Clicking edit opens modal with current values pre-filled | Modal opens; inputs contain current `first_name`, `last_name`, `development_goals` |
| AC-2.3.3 | Modal title is "Edit Report" | Heading with exact text present |
| AC-2.3.4 | All validation rules from US-2.2 apply | Same validation as AC-2.2.5 through AC-2.2.14 |
| AC-2.3.5 | Form has "Cancel" button that discards changes | Clicking Cancel closes modal; database unchanged |
| AC-2.3.6 | Form has "Save" button | Button with text "Save" present |
| AC-2.3.7 | On save, report is updated in database | `UPDATE reports SET ... WHERE id = :reportId` |
| AC-2.3.8 | On save, updated_at is set to current timestamp | `report.updated_at` is within 1 second of now |
| AC-2.3.9 | On save, modal closes and page reflects changes | Modal closes; displayed name/goals updated |
| AC-2.3.10 | Success message shown: "Report updated successfully" | Toast/notification with exact text |

---

### US-2.4: Delete a Report

**As a** team lead  
**I want to** delete a report I added by mistake  
**So that** I can keep my report list accurate

#### Acceptance Criteria

| ID | Criterion | Validation |
|----|-----------|------------|
| AC-2.4.1 | Edit Report modal includes "Delete Report" button | Button visible with text "Delete Report" in red/danger styling |
| AC-2.4.2 | Clicking Delete opens confirmation modal | Second modal appears with `role="alertdialog"` |
| AC-2.4.3 | Confirmation modal shows report's full name | Text includes `${first_name} ${last_name}` |
| AC-2.4.4 | Confirmation modal warns: "This will permanently delete this report and all their entries across all cycles. This action cannot be undone." | Exact text present |
| AC-2.4.5 | Confirmation modal shows count of entries that will be deleted | Count from `SELECT COUNT(*) FROM entries WHERE report_id = :id` |
| AC-2.4.6 | Confirmation modal has "Cancel" button | Button present |
| AC-2.4.7 | Cancel closes confirmation modal without deleting | Modal closes; no database changes |
| AC-2.4.8 | Confirmation modal has "Delete" button in red/danger styling | Button present with danger styling |
| AC-2.4.9 | On delete, all entries for this report are deleted | `DELETE FROM entries WHERE report_id = :id` |
| AC-2.4.10 | On delete, all archived goals for this report are deleted | `DELETE FROM archived_goals WHERE report_id = :id` |
| AC-2.4.11 | On delete, report is deleted | `DELETE FROM reports WHERE id = :id` |
| AC-2.4.12 | On delete, user is redirected to home page | URL changes to `/` |
| AC-2.4.13 | Success message shown: "Report deleted successfully" | Toast/notification with exact text |

---

### US-2.5: Edit Development Goals Inline

**As a** team lead  
**I want to** quickly edit development goals from the diary page  
**So that** I can update goals without opening the full edit form

#### Acceptance Criteria

| ID | Criterion | Validation |
|----|-----------|------------|
| AC-2.5.1 | Report diary page shows "Development Goals" section | Section with heading "Development Goals" visible |
| AC-2.5.2 | If goals exist, they are rendered as formatted markdown | Markdown rendered (headings, lists, bold, etc. display correctly) |
| AC-2.5.3 | If goals are empty, show placeholder "No development goals set. Click edit to add." | Placeholder text visible when `development_goals` is null or empty |
| AC-2.5.4 | Section has "Edit" button | Button with text "Edit" or pencil icon with accessible label |
| AC-2.5.5 | Clicking Edit replaces rendered markdown with textarea | Textarea appears; rendered markdown hidden |
| AC-2.5.6 | Textarea contains current raw markdown | `textarea.value === report.development_goals` |
| AC-2.5.7 | Textarea has max length of 5000 characters with counter | Validation error if exceeded; counter shows "X / 5000" |
| AC-2.5.8 | Edit mode shows "Cancel" and "Save" buttons | Both buttons visible |
| AC-2.5.9 | Cancel discards changes and returns to view mode | Textarea replaced with original rendered markdown |
| AC-2.5.10 | Save persists changes and returns to view mode | Database updated; textarea replaced with new rendered markdown |
| AC-2.5.11 | Save updates updated_at timestamp | `report.updated_at` is within 1 second of now |

---

## Epic 3: Entry Management

### US-3.1: View Diary Entries

**As a** team lead  
**I want to** see all diary entries for a report in the current cycle  
**So that** I can review what I've tracked about them

#### Acceptance Criteria

| ID | Criterion | Validation |
|----|-----------|------------|
| AC-3.1.1 | Report diary page shows all entries for current active cycle | Entries where `report_id = :reportId AND cycle_id = :activeCycleId` |
| AC-3.1.2 | Entries are sorted by created_at descending (newest first) | `ORDER BY created_at DESC` |
| AC-3.1.3 | Each entry card shows entry type as a badge | Badge with type label visible (e.g., "Feedback", "Accomplishment") |
| AC-3.1.4 | Entry type badge has distinct color per type | Feedback: blue, Accomplishment: green, Kudos: yellow, Notes: gray, Career Conversation: purple, Third-Party Feedback: orange |
| AC-3.1.5 | Each entry card shows created date in format "MMM D, YYYY" | Date formatted correctly |
| AC-3.1.6 | Each entry card shows created time in format "h:mm A" | Time formatted correctly (e.g., "2:30 PM") |
| AC-3.1.7 | Each entry card shows type-specific content preview (see US-3.3 through US-3.8) | Content displayed according to entry type |
| AC-3.1.8 | If no entries exist, show empty state: "No entries yet. Start tracking by adding your first entry." | Message visible when entry count is 0 |
| AC-3.1.9 | Empty state includes "Add Entry" button | Button visible in empty state |

---

### US-3.2: Filter Diary Entries by Type

**As a** team lead  
**I want to** filter entries by type  
**So that** I can focus on specific categories of information

#### Acceptance Criteria

| ID | Criterion | Validation |
|----|-----------|------------|
| AC-3.2.1 | Report diary page shows filter control above entry list | Filter UI element visible above entries |
| AC-3.2.2 | Filter shows "All Types" option | Option with text "All Types" present |
| AC-3.2.3 | Filter shows option for each entry type: Feedback, Accomplishment, Kudos, Notes, Career Conversation, Third-Party Feedback | All 6 options present |
| AC-3.2.4 | "All Types" is selected by default | Default selection is "All Types" |
| AC-3.2.5 | Selecting a type filters entries to only that type | Only entries where `entry_type = :selectedType` displayed |
| AC-3.2.6 | Selecting "All Types" shows all entries | No type filter applied |
| AC-3.2.7 | Filtered empty state shows: "No [type] entries yet" | Message with selected type name |
| AC-3.2.8 | Filter selection persists during the session but resets on page reload | Selection maintained while navigating within diary; URL does not include filter state |
| AC-3.2.9 | Entry count updates to reflect filtered count | Count shows filtered result count |

---

### US-3.3: Add Feedback Entry

**As a** team lead  
**I want to** add structured feedback using the SBI framework  
**So that** I can document actionable feedback I've given

#### Acceptance Criteria

| ID | Criterion | Validation |
|----|-----------|------------|
| AC-3.3.1 | "Add Entry" button exists on diary page | Button with text "Add Entry" visible |
| AC-3.3.2 | Clicking "Add Entry" opens entry type selection | Modal or menu with all 6 entry types listed |
| AC-3.3.3 | Selecting "Feedback" opens Feedback entry form | Form specific to Feedback type displayed |
| AC-3.3.4 | Form title is "Add Feedback" | Heading with exact text |
| AC-3.3.5 | Form has "Feedback Type" radio buttons with options "Positive" and "Constructive" | Two radio buttons with exact labels |
| AC-3.3.6 | Feedback Type is required | Validation error "Please select feedback type" if neither selected |
| AC-3.3.7 | "Positive" radio is visually styled in green | Green color/accent on Positive option |
| AC-3.3.8 | "Constructive" radio is visually styled in amber/orange | Amber/orange color/accent on Constructive option |
| AC-3.3.9 | Form has "Situation" textarea with helper text: "Describe the specific context—when and where this occurred" | Textarea with label and helper text present |
| AC-3.3.10 | Situation is required | Validation error "Situation is required" if empty |
| AC-3.3.11 | Situation must be 1-1000 characters | Validation error if out of range; character count shown |
| AC-3.3.12 | Form has "Behavior" textarea with helper text: "Describe the specific, observable action (not your interpretation)" | Textarea with label and helper text present |
| AC-3.3.13 | Behavior is required | Validation error "Behavior is required" if empty |
| AC-3.3.14 | Behavior must be 1-1000 characters | Validation error if out of range; character count shown |
| AC-3.3.15 | Form has "Impact" textarea with helper text: "Describe the effect on you, the team, or outcomes" | Textarea with label and helper text present |
| AC-3.3.16 | Impact is required | Validation error "Impact is required" if empty |
| AC-3.3.17 | Impact must be 1-1000 characters | Validation error if out of range; character count shown |
| AC-3.3.18 | Form has "Notes" textarea (optional) with label "Additional notes (optional)" | Textarea present, marked as optional |
| AC-3.3.19 | Notes accepts markdown | Field accepts markdown syntax |
| AC-3.3.20 | Notes has max length of 2000 characters | Validation error if exceeded; character count shown |
| AC-3.3.21 | Form has "Cancel" button | Button present |
| AC-3.3.22 | Cancel closes form without saving | Form closes; no new entry in database |
| AC-3.3.23 | Form has "Save" button | Button present |
| AC-3.3.24 | Save is disabled while form is invalid | Button disabled when required fields empty or validation fails |
| AC-3.3.25 | On save, entry is created with type "feedback" | `entry.entry_type === "feedback"` |
| AC-3.3.26 | On save, entry is linked to current active cycle | `entry.cycle_id === activeCycle.id` |
| AC-3.3.27 | On save, entry is linked to current report | `entry.report_id === currentReport.id` |
| AC-3.3.28 | On save, feedback_type is stored | `entry.feedback_type === "positive" \|\| "constructive"` |
| AC-3.3.29 | On save, situation, behavior, impact are stored | Fields populated in database |
| AC-3.3.30 | On save, notes is stored (may be null) | `entry.notes` matches input or is null |
| AC-3.3.31 | On save, created_at and updated_at are set | Timestamps within 1 second of now |
| AC-3.3.32 | On save, form closes and entry appears at top of list | Form closes; new entry visible first |
| AC-3.3.33 | Success message: "Feedback added successfully" | Toast with exact text |

#### Feedback Entry Display (in diary list)

| ID | Criterion | Validation |
|----|-----------|------------|
| AC-3.3.34 | Badge shows "Positive Feedback" or "Constructive Feedback" based on type | Badge text includes feedback subtype |
| AC-3.3.35 | Card shows Situation, Behavior, Impact as labeled sections | Three sections with "Situation:", "Behavior:", "Impact:" labels |
| AC-3.3.36 | If notes exist, they are shown below SBI sections with "Notes:" label | Notes section visible when `entry.notes` is not null |
| AC-3.3.37 | Notes are rendered as formatted markdown | Markdown formatting applied |

---

### US-3.4: Add Accomplishment Entry

**As a** team lead  
**I want to** record an accomplishment by a report  
**So that** I can remember their achievements at review time

#### Acceptance Criteria

| ID | Criterion | Validation |
|----|-----------|------------|
| AC-3.4.1 | Selecting "Accomplishment" from entry type selection opens Accomplishment form | Form specific to Accomplishment type displayed |
| AC-3.4.2 | Form title is "Add Accomplishment" | Heading with exact text |
| AC-3.4.3 | Form has "Description" textarea with label "What did they accomplish?" | Textarea with label present |
| AC-3.4.4 | Description is required | Validation error "Description is required" if empty |
| AC-3.4.5 | Description accepts markdown | Field accepts markdown syntax |
| AC-3.4.6 | Description must be 1-5000 characters | Validation error if out of range; character count shown |
| AC-3.4.7 | Form has Cancel and Save buttons with standard behavior | Same as AC-3.3.21 through AC-3.3.24 |
| AC-3.4.8 | On save, entry is created with type "accomplishment" | `entry.entry_type === "accomplishment"` |
| AC-3.4.9 | On save, description is stored in notes field | `entry.notes === description` |
| AC-3.4.10 | Standard save behavior (cycle, report, timestamps) | Same as AC-3.3.26 through AC-3.3.32 |
| AC-3.4.11 | Success message: "Accomplishment added successfully" | Toast with exact text |

#### Accomplishment Entry Display

| ID | Criterion | Validation |
|----|-----------|------------|
| AC-3.4.12 | Badge shows "Accomplishment" | Badge text is "Accomplishment" |
| AC-3.4.13 | Card shows description rendered as markdown | Markdown formatting applied to `entry.notes` |

---

### US-3.5: Add Kudos Entry

**As a** team lead  
**I want to** record kudos a report received  
**So that** I can track recognition they've gotten from others

#### Acceptance Criteria

| ID | Criterion | Validation |
|----|-----------|------------|
| AC-3.5.1 | Selecting "Kudos" from entry type selection opens Kudos form | Form specific to Kudos type displayed |
| AC-3.5.2 | Form title is "Add Kudos" | Heading with exact text |
| AC-3.5.3 | Form has "Link" input field with label "Link to kudos (optional)" and placeholder "https://..." | Input field present with label and placeholder |
| AC-3.5.4 | Link is optional | Form submits successfully with empty link |
| AC-3.5.5 | If provided, link must be a valid URL starting with http:// or https:// | Validation error "Please enter a valid URL" if invalid format |
| AC-3.5.6 | Link has max length of 500 characters | Validation error if exceeded |
| AC-3.5.7 | Form has "Description" textarea with label "Describe the kudos" | Textarea with label present |
| AC-3.5.8 | Description is required | Validation error "Description is required" if empty |
| AC-3.5.9 | Description accepts markdown | Field accepts markdown syntax |
| AC-3.5.10 | Description must be 1-5000 characters | Validation error if out of range; character count shown |
| AC-3.5.11 | Standard form buttons and save behavior | Same patterns as previous entry types |
| AC-3.5.12 | On save, entry is created with type "kudos" | `entry.entry_type === "kudos"` |
| AC-3.5.13 | On save, link is stored | `entry.link === inputLink \|\| null` |
| AC-3.5.14 | On save, description is stored in notes field | `entry.notes === description` |
| AC-3.5.15 | Success message: "Kudos added successfully" | Toast with exact text |

#### Kudos Entry Display

| ID | Criterion | Validation |
|----|-----------|------------|
| AC-3.5.16 | Badge shows "Kudos" | Badge text is "Kudos" |
| AC-3.5.17 | If link exists, it is displayed as clickable link | Anchor tag with `href` and `target="_blank"` |
| AC-3.5.18 | Link opens in new tab | `target="_blank"` and `rel="noopener noreferrer"` |
| AC-3.5.19 | Description is rendered as markdown | Markdown formatting applied |

---

### US-3.6: Add Notes Entry

**As a** team lead  
**I want to** add general notes about a report  
**So that** I can capture observations that don't fit other categories

#### Acceptance Criteria

| ID | Criterion | Validation |
|----|-----------|------------|
| AC-3.6.1 | Selecting "Notes" from entry type selection opens Notes form | Form specific to Notes type displayed |
| AC-3.6.2 | Form title is "Add Note" | Heading with exact text (singular) |
| AC-3.6.3 | Form has "Content" textarea with label "Note" | Textarea with label present |
| AC-3.6.4 | Content is required | Validation error "Note content is required" if empty |
| AC-3.6.5 | Content accepts markdown | Field accepts markdown syntax |
| AC-3.6.6 | Content must be 1-5000 characters | Validation error if out of range; character count shown |
| AC-3.6.7 | Standard form buttons and save behavior | Same patterns as previous entry types |
| AC-3.6.8 | On save, entry is created with type "notes" | `entry.entry_type === "notes"` |
| AC-3.6.9 | On save, content is stored in notes field | `entry.notes === content` |
| AC-3.6.10 | Success message: "Note added successfully" | Toast with exact text |

#### Notes Entry Display

| ID | Criterion | Validation |
|----|-----------|------------|
| AC-3.6.11 | Badge shows "Note" | Badge text is "Note" (singular) |
| AC-3.6.12 | Content is rendered as markdown | Markdown formatting applied |

---

### US-3.7: Add Career Conversation Entry

**As a** team lead  
**I want to** document career development conversations  
**So that** I can track discussions about their growth and aspirations

#### Acceptance Criteria

| ID | Criterion | Validation |
|----|-----------|------------|
| AC-3.7.1 | Selecting "Career Conversation" from entry type selection opens form | Form specific to Career Conversation type displayed |
| AC-3.7.2 | Form title is "Add Career Conversation" | Heading with exact text |
| AC-3.7.3 | Form has "Content" textarea with label "Conversation notes" | Textarea with label present |
| AC-3.7.4 | Content is required | Validation error "Conversation notes are required" if empty |
| AC-3.7.5 | Content accepts markdown | Field accepts markdown syntax |
| AC-3.7.6 | Content must be 1-5000 characters | Validation error if out of range; character count shown |
| AC-3.7.7 | Standard form buttons and save behavior | Same patterns as previous entry types |
| AC-3.7.8 | On save, entry is created with type "career_conversation" | `entry.entry_type === "career_conversation"` |
| AC-3.7.9 | On save, content is stored in notes field | `entry.notes === content` |
| AC-3.7.10 | Success message: "Career conversation added successfully" | Toast with exact text |

#### Career Conversation Entry Display

| ID | Criterion | Validation |
|----|-----------|------------|
| AC-3.7.11 | Badge shows "Career Conversation" | Badge text is "Career Conversation" |
| AC-3.7.12 | Content is rendered as markdown | Markdown formatting applied |

---

### US-3.8: Add Third-Party Feedback Entry

**As a** team lead  
**I want to** record feedback I received from colleagues about a report  
**So that** I can include diverse perspectives in reviews

#### Acceptance Criteria

| ID | Criterion | Validation |
|----|-----------|------------|
| AC-3.8.1 | Selecting "Third-Party Feedback" from entry type selection opens form | Form specific to Third-Party Feedback type displayed |
| AC-3.8.2 | Form title is "Add Third-Party Feedback" | Heading with exact text |
| AC-3.8.3 | Form has "Feedback provider" input with label "Who provided this feedback?" | Input field with label present |
| AC-3.8.4 | Feedback provider is required | Validation error "Feedback provider is required" if empty |
| AC-3.8.5 | Feedback provider must be 1-100 characters | Validation error if out of range |
| AC-3.8.6 | Feedback provider is trimmed | Leading/trailing whitespace removed |
| AC-3.8.7 | Form has "Feedback" textarea with label "Feedback content" | Textarea with label present |
| AC-3.8.8 | Feedback content is required | Validation error "Feedback content is required" if empty |
| AC-3.8.9 | Feedback content accepts markdown | Field accepts markdown syntax |
| AC-3.8.10 | Feedback content must be 1-5000 characters | Validation error if out of range; character count shown |
| AC-3.8.11 | Standard form buttons and save behavior | Same patterns as previous entry types |
| AC-3.8.12 | On save, entry is created with type "third_party_feedback" | `entry.entry_type === "third_party_feedback"` |
| AC-3.8.13 | On save, provider name is stored | `entry.provider_name === providerInput` |
| AC-3.8.14 | On save, content is stored in notes field | `entry.notes === feedbackContent` |
| AC-3.8.15 | Success message: "Third-party feedback added successfully" | Toast with exact text |

#### Third-Party Feedback Entry Display

| ID | Criterion | Validation |
|----|-----------|------------|
| AC-3.8.16 | Badge shows "Third-Party Feedback" | Badge text is "Third-Party Feedback" |
| AC-3.8.17 | Provider name is displayed with label "From:" | Text shows "From: [provider_name]" |
| AC-3.8.18 | Feedback content is rendered as markdown | Markdown formatting applied |

---

### US-3.9: Edit Entry

**As a** team lead  
**I want to** edit an existing diary entry  
**So that** I can fix mistakes or add information

#### Acceptance Criteria

| ID | Criterion | Validation |
|----|-----------|------------|
| AC-3.9.1 | Each entry card has an "Edit" button or icon | Button/icon visible on hover or always visible |
| AC-3.9.2 | Edit button has accessible label "Edit entry" | `aria-label="Edit entry"` or visible text |
| AC-3.9.3 | Clicking Edit opens the entry form pre-filled with current values | All fields populated with existing data |
| AC-3.9.4 | Form title changes to "Edit [Entry Type]" | e.g., "Edit Feedback", "Edit Accomplishment" |
| AC-3.9.5 | Entry type cannot be changed | Type selection not shown; type is fixed |
| AC-3.9.6 | All validation rules for the entry type still apply | Same validations as creation |
| AC-3.9.7 | Cancel discards changes | Original values preserved in database |
| AC-3.9.8 | Save updates the entry | `UPDATE entries SET ... WHERE id = :entryId` |
| AC-3.9.9 | Save updates updated_at timestamp | `entry.updated_at` is within 1 second of now |
| AC-3.9.10 | Save does not change created_at | `entry.created_at` unchanged |
| AC-3.9.11 | Form closes and entry card updates | Updated content visible |
| AC-3.9.12 | Entry position in list does not change (still sorted by created_at) | Entry remains in same position |
| AC-3.9.13 | Success message: "[Entry type] updated successfully" | Toast with entry type name |

---

### US-3.10: Delete Entry

**As a** team lead  
**I want to** delete an entry I no longer need  
**So that** I can remove incorrect or irrelevant information

#### Acceptance Criteria

| ID | Criterion | Validation |
|----|-----------|------------|
| AC-3.10.1 | Each entry card has a "Delete" button or icon | Button/icon visible on hover or always visible |
| AC-3.10.2 | Delete button has accessible label "Delete entry" | `aria-label="Delete entry"` or visible text |
| AC-3.10.3 | Delete button is styled as destructive (red or danger color) | Red/danger styling applied |
| AC-3.10.4 | Clicking Delete opens confirmation modal | Modal appears with `role="alertdialog"` |
| AC-3.10.5 | Modal text: "Are you sure you want to delete this entry? This action cannot be undone." | Exact text present |
| AC-3.10.6 | Modal shows entry type and preview of content | Entry type badge and truncated content shown |
| AC-3.10.7 | Modal has "Cancel" button | Button present |
| AC-3.10.8 | Cancel closes modal without deleting | Modal closes; entry unchanged |
| AC-3.10.9 | Modal has "Delete" button in danger styling | Button present with red/danger styling |
| AC-3.10.10 | On confirm, entry is deleted from database | `DELETE FROM entries WHERE id = :entryId` |
| AC-3.10.11 | Modal closes and entry removed from list | Entry card no longer visible |
| AC-3.10.12 | Success message: "Entry deleted successfully" | Toast with exact text |

---

## Epic 4: Navigation & Layout

### US-4.1: Global Navigation

**As a** team lead  
**I want to** navigate between main sections of the app  
**So that** I can access different features easily

#### Acceptance Criteria

| ID | Criterion | Validation |
|----|-----------|------------|
| AC-4.1.1 | Header is visible on all pages | Header element present on every page |
| AC-4.1.2 | Header shows app name "Team Performance Diary" | Text present in header |
| AC-4.1.3 | Header has link to Home (report list) | Link to `/` present |
| AC-4.1.4 | Header has link to Settings | Link to `/settings` present |
| AC-4.1.5 | Current section is visually indicated | Active link has distinct styling |
| AC-4.1.6 | Report diary page shows breadcrumb: "Home > [Report Name]" | Breadcrumb navigation visible |
| AC-4.1.7 | Breadcrumb "Home" links back to report list | Clicking "Home" navigates to `/` |

---

### US-4.2: Responsive Layout

**As a** team lead  
**I want to** use the app on different screen sizes  
**So that** I can access it from my laptop or tablet

#### Acceptance Criteria

| ID | Criterion | Validation |
|----|-----------|------------|
| AC-4.2.1 | App is usable at viewport width 1024px (laptop) | All features accessible; no horizontal scroll |
| AC-4.2.2 | App is usable at viewport width 768px (tablet) | All features accessible; layout adapts |
| AC-4.2.3 | Minimum supported width is 768px | Below 768px, experience may degrade |
| AC-4.2.4 | Touch targets are at least 44x44px on tablet | Buttons and interactive elements meet size requirement |
| AC-4.2.5 | Modals are scrollable if content exceeds viewport | Modal content scrolls; modal doesn't overflow |

---

## Epic 5: Data Integrity & Error Handling

### US-5.1: Handle Network Errors

**As a** team lead  
**I want to** see clear error messages when something goes wrong  
**So that** I know my data wasn't saved and can try again

#### Acceptance Criteria

| ID | Criterion | Validation |
|----|-----------|------------|
| AC-5.1.1 | If API request fails, error toast is shown | Toast appears with error styling |
| AC-5.1.2 | Error message is user-friendly: "Something went wrong. Please try again." | No technical jargon; exact text |
| AC-5.1.3 | Form modals stay open on save error | User can retry without re-entering data |
| AC-5.1.4 | Save button shows loading state during request | Button shows spinner or "Saving..." text |
| AC-5.1.5 | Save button is disabled during request to prevent double submission | Button has `disabled` attribute while loading |

---

### US-5.2: Prevent Data Loss

**As a** team lead  
**I want to** be warned before losing unsaved changes  
**So that** I don't accidentally discard my work

#### Acceptance Criteria

| ID | Criterion | Validation |
|----|-----------|------------|
| AC-5.2.1 | If form has unsaved changes and user clicks Cancel, confirmation is shown | Confirm dialog or modal appears |
| AC-5.2.2 | Confirmation text: "You have unsaved changes. Are you sure you want to discard them?" | Exact text present |
| AC-5.2.3 | User can choose to stay and continue editing | "Keep editing" option returns to form |
| AC-5.2.4 | User can choose to discard and close | "Discard" option closes form |
| AC-5.2.5 | If form has no changes, Cancel closes immediately without confirmation | No confirmation shown |

---

# Database Schema

```sql
-- Cycles
CREATE TABLE cycles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL CHECK (status IN ('active', 'archived')),
  start_date DATE NOT NULL,
  end_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reports  
CREATE TABLE reports (
  id TEXT PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  development_goals TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Archived Goals (snapshot when cycle is archived)
CREATE TABLE archived_goals (
  id TEXT PRIMARY KEY,
  report_id TEXT NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  cycle_id TEXT NOT NULL REFERENCES cycles(id) ON DELETE CASCADE,
  development_goals TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(report_id, cycle_id)
);

-- Entries
CREATE TABLE entries (
  id TEXT PRIMARY KEY,
  report_id TEXT NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  cycle_id TEXT NOT NULL REFERENCES cycles(id) ON DELETE CASCADE,
  entry_type TEXT NOT NULL CHECK (entry_type IN (
    'feedback', 'accomplishment', 'kudos', 'notes', 
    'career_conversation', 'third_party_feedback'
  )),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Feedback-specific fields
  feedback_type TEXT CHECK (feedback_type IN ('positive', 'constructive')),
  situation TEXT,
  behavior TEXT,
  impact TEXT,
  
  -- Shared fields
  notes TEXT,
  link TEXT,
  provider_name TEXT
);

-- Indexes
CREATE INDEX idx_entries_report_cycle ON entries(report_id, cycle_id);
CREATE INDEX idx_entries_type ON entries(entry_type);
CREATE INDEX idx_archived_goals_report ON archived_goals(report_id);
```

---

# API Endpoints

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | `/api/cycles` | List all cycles | - | `{ cycles: Cycle[] }` |
| GET | `/api/cycles/active` | Get active cycle | - | `{ cycle: Cycle }` |
| POST | `/api/cycles` | Create new cycle | `{ name, start_date }` | `{ cycle: Cycle }` |
| POST | `/api/cycles/archive` | Archive active & create new | `{ new_cycle_name }` | `{ archived: Cycle, new: Cycle }` |
| GET | `/api/cycles/:id` | Get cycle with reports | - | `{ cycle: Cycle, reports: Report[] }` |
| GET | `/api/reports` | List all reports | - | `{ reports: Report[] }` |
| POST | `/api/reports` | Create report | `{ first_name, last_name, development_goals? }` | `{ report: Report }` |
| GET | `/api/reports/:id` | Get report detail | - | `{ report: Report }` |
| PUT | `/api/reports/:id` | Update report | `{ first_name?, last_name?, development_goals? }` | `{ report: Report }` |
| DELETE | `/api/reports/:id` | Delete report | - | `{ success: true }` |
| GET | `/api/reports/:id/entries` | List entries | Query: `?cycle_id&type` | `{ entries: Entry[] }` |
| POST | `/api/entries` | Create entry | Entry fields by type | `{ entry: Entry }` |
| PUT | `/api/entries/:id` | Update entry | Entry fields by type | `{ entry: Entry }` |
| DELETE | `/api/entries/:id` | Delete entry | - | `{ success: true }` |
| GET | `/api/archived-goals/:reportId/:cycleId` | Get archived goals | - | `{ goals: ArchivedGoal }` |

---

# Open Questions

1. **Cycle naming**: Should names follow a format (e.g., "H1 2025") or be free text?
   - **Recommendation**: Free text with examples shown as placeholder

2. **Goal carryover**: When archiving, should goals copy to new cycle?
   - **Recommendation**: Ask user in archive modal: "Copy current goals to new cycle?" checkbox

3. **Report deletion**: Allow full delete or just archive?
   - **Current spec**: Full delete with confirmation showing entry count
   - **Alternative**: Add "archived" status to reports instead

---

# Appendix A: SBI Framework Reference

The Situation-Behavior-Impact framework structures clear, actionable feedback:

- **Situation**: Anchor the feedback in a specific time and place.  
  *"During yesterday's design review..."*

- **Behavior**: Describe what the person did, factually and specifically.  
  *"You interrupted the PM twice while they were explaining requirements..."*

- **Impact**: Explain the consequence of the behavior.  
  *"This made it harder for the team to understand the full context, and the PM seemed frustrated."*

This structure separates observation from interpretation and focuses on changeable behaviors rather than personality traits.

---

# Appendix B: Entry Type Summary

| Type | Required Fields | Optional Fields | Badge Color |
|------|-----------------|-----------------|-------------|
| Feedback | feedback_type, situation, behavior, impact | notes | Blue |
| Accomplishment | notes (description) | - | Green |
| Kudos | notes (description) | link | Yellow |
| Notes | notes (content) | - | Gray |
| Career Conversation | notes (content) | - | Purple |
| Third-Party Feedback | provider_name, notes (content) | - | Orange |