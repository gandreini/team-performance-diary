# Technical Specifications - Team Performance Diary

## Overview

A personal web application for design team leads to track performance-related information about their direct reports throughout review cycles. The app serves as a structured diary, capturing feedback, accomplishments, kudos, notes, career conversations, and third-party feedback - all organized chronologically and filterable by type.

## Problem Statement

During a review cycle (typically a semester), team leads accumulate scattered notes about their reports: feedback given, accomplishments observed, kudos received, career conversations held, and third-party input collected. This information lives in various places - Slack, docs, memory - making it difficult to write accurate, evidence-based performance reviews.

## Users

Single user: the design team lead. No multi-user or authentication required.

---

## System Architecture

### Technical Stack

| Component | Technology |
|-----------|------------|
| Framework | Next.js (App Router) |
| Database | SQLite via Turso |
| ORM | Drizzle ORM |
| Styling | Tailwind CSS |
| Deployment | Vercel (Hobby tier) |
| Markdown | react-markdown |

### Application Routes

```
/                           - Home (Reports list)
/reports/[reportId]         - Report diary page
/settings                   - Settings with cycle management
/cycles/[cycleId]           - Archived cycle view
```

---

## Database Schema

### Tables

#### cycles
```sql
CREATE TABLE cycles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL CHECK (status IN ('active', 'archived')),
  start_date DATE NOT NULL,
  end_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### reports
```sql
CREATE TABLE reports (
  id TEXT PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  development_goals TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### archived_goals
```sql
CREATE TABLE archived_goals (
  id TEXT PRIMARY KEY,
  report_id TEXT NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  cycle_id TEXT NOT NULL REFERENCES cycles(id) ON DELETE CASCADE,
  development_goals TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(report_id, cycle_id)
);
```

#### entries
```sql
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
```

### Indexes
```sql
CREATE INDEX idx_entries_report_cycle ON entries(report_id, cycle_id);
CREATE INDEX idx_entries_type ON entries(entry_type);
CREATE INDEX idx_archived_goals_report ON archived_goals(report_id);
```

---

## API Specifications

### Cycles API

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | `/api/cycles` | List all cycles | - | `{ cycles: Cycle[] }` |
| GET | `/api/cycles/active` | Get active cycle | - | `{ cycle: Cycle }` |
| POST | `/api/cycles` | Create new cycle | `{ name, start_date }` | `{ cycle: Cycle }` |
| POST | `/api/cycles/archive` | Archive active & create new | `{ new_cycle_name }` | `{ archived: Cycle, new: Cycle }` |
| GET | `/api/cycles/:id` | Get cycle with reports | - | `{ cycle: Cycle, reports: Report[] }` |

### Reports API

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | `/api/reports` | List all reports | - | `{ reports: Report[] }` |
| POST | `/api/reports` | Create report | `{ first_name, last_name, development_goals? }` | `{ report: Report }` |
| GET | `/api/reports/:id` | Get report detail | - | `{ report: Report }` |
| PUT | `/api/reports/:id` | Update report | `{ first_name?, last_name?, development_goals? }` | `{ report: Report }` |
| DELETE | `/api/reports/:id` | Delete report | - | `{ success: true }` |
| GET | `/api/reports/:id/entries` | List entries | Query: `?cycle_id&type` | `{ entries: Entry[] }` |

### Entries API

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| POST | `/api/entries` | Create entry | Entry fields by type | `{ entry: Entry }` |
| PUT | `/api/entries/:id` | Update entry | Entry fields by type | `{ entry: Entry }` |
| DELETE | `/api/entries/:id` | Delete entry | - | `{ success: true }` |

### Archived Goals API

| Method | Endpoint | Description | Response |
|--------|----------|-------------|----------|
| GET | `/api/archived-goals/:reportId/:cycleId` | Get archived goals | `{ goals: ArchivedGoal }` |

---

## Data Models

### Cycle
```typescript
interface Cycle {
  id: string;           // UUID
  name: string;         // 1-50 chars, unique
  status: 'active' | 'archived';
  start_date: string;   // ISO date YYYY-MM-DD
  end_date: string | null;
  created_at: string;   // ISO timestamp
}
```

### Report
```typescript
interface Report {
  id: string;              // UUID
  first_name: string;      // 1-50 chars
  last_name: string;       // 1-50 chars
  development_goals: string | null;  // max 5000 chars, markdown
  created_at: string;
  updated_at: string;
}
```

### Entry
```typescript
interface Entry {
  id: string;              // UUID
  report_id: string;
  cycle_id: string;
  entry_type: EntryType;
  created_at: string;
  updated_at: string;

  // Feedback-specific
  feedback_type?: 'positive' | 'constructive';
  situation?: string;      // 1-1000 chars
  behavior?: string;       // 1-1000 chars
  impact?: string;         // 1-1000 chars

  // Shared
  notes?: string;          // max 5000 chars (2000 for feedback notes)
  link?: string;           // valid URL, max 500 chars
  provider_name?: string;  // 1-100 chars
}

type EntryType =
  | 'feedback'
  | 'accomplishment'
  | 'kudos'
  | 'notes'
  | 'career_conversation'
  | 'third_party_feedback';
```

### ArchivedGoal
```typescript
interface ArchivedGoal {
  id: string;
  report_id: string;
  cycle_id: string;
  development_goals: string | null;
  created_at: string;
}
```

---

## Entry Type Specifications

### 1. Feedback (SBI Framework)
**Required Fields:**
- `feedback_type`: "positive" | "constructive"
- `situation`: Context description (1-1000 chars)
- `behavior`: Observable action (1-1000 chars)
- `impact`: Effect/consequence (1-1000 chars)

**Optional Fields:**
- `notes`: Additional notes (max 2000 chars, markdown)

**Display:**
- Badge: "Positive Feedback" (green) or "Constructive Feedback" (amber)
- Show labeled sections for Situation, Behavior, Impact
- Render notes as markdown if present

### 2. Accomplishment
**Required Fields:**
- `notes`: Description (1-5000 chars, markdown)

**Display:**
- Badge: "Accomplishment" (green)
- Render notes as markdown

### 3. Kudos
**Required Fields:**
- `notes`: Description (1-5000 chars, markdown)

**Optional Fields:**
- `link`: URL to kudos source (valid http/https, max 500 chars)

**Display:**
- Badge: "Kudos" (yellow)
- Show link as clickable (opens in new tab)
- Render notes as markdown

### 4. Notes
**Required Fields:**
- `notes`: Content (1-5000 chars, markdown)

**Display:**
- Badge: "Note" (gray)
- Render notes as markdown

### 5. Career Conversation
**Required Fields:**
- `notes`: Conversation notes (1-5000 chars, markdown)

**Display:**
- Badge: "Career Conversation" (purple)
- Render notes as markdown

### 6. Third-Party Feedback
**Required Fields:**
- `provider_name`: Who provided feedback (1-100 chars)
- `notes`: Feedback content (1-5000 chars, markdown)

**Display:**
- Badge: "Third-Party Feedback" (orange)
- Show "From: [provider_name]"
- Render notes as markdown

---

## User Interface Requirements

### Global Layout
- Header visible on all pages
- App title: "Team Performance Diary"
- Navigation: Home link, Settings link
- Current section visually indicated

### Home Page (/)
- List all reports as cards
- Sort: alphabetically by first_name, then last_name
- Card shows: Full name, entry count for current cycle
- Entry count: "[n] entries" (plural) or "1 entry" (singular)
- Empty state: "No reports yet. Add your first report to get started." + Add button
- "Add Report" button always visible

### Report Diary Page (/reports/[id])
- Breadcrumb: "Home > [Report Name]"
- Development Goals section with inline edit
- Entry filter by type
- Entry list sorted by created_at DESC
- Each entry: type badge, date/time, content preview
- Edit/Delete actions on each entry
- "Add Entry" button

### Settings Page (/settings)
- Current cycle info: name, start date, "Active" badge
- "Archive & Start New Cycle" button
- Archived cycles list (sorted by end_date DESC)
- Each archived cycle clickable to view details

### Archived Cycle View (/cycles/[id])
- "Archived" badge in header
- Cycle name and date range
- List of reports with entries in that cycle
- Read-only: no edit/delete buttons
- Back button to Settings

---

## Validation Rules

### Names (first_name, last_name)
- Required
- 1-50 characters after trimming
- Trimmed of leading/trailing whitespace

### Cycle Name
- Required
- 1-50 characters
- Must be unique across all cycles

### Development Goals
- Optional
- Max 5000 characters
- Accepts markdown

### Entry Notes
- Max 5000 characters (2000 for feedback additional notes)
- Accepts markdown

### SBI Fields (situation, behavior, impact)
- Required for feedback entries
- 1-1000 characters each

### Link (Kudos)
- Optional
- Must start with http:// or https://
- Max 500 characters

### Provider Name (Third-Party Feedback)
- Required
- 1-100 characters
- Trimmed of leading/trailing whitespace

---

## Error Handling

### Network Errors
- Display toast: "Something went wrong. Please try again."
- Keep form modals open on save error
- No technical jargon in messages

### Form Validation
- Show inline validation errors
- Disable save button when form is invalid
- Character counters for length-limited fields

### Loading States
- Save buttons show loading state during request
- Buttons disabled during submission to prevent double-submit

### Unsaved Changes
- Warn before discarding: "You have unsaved changes. Are you sure you want to discard them?"
- Options: "Keep editing" or "Discard"
- No warning if form unchanged

---

## Responsive Design

### Breakpoints
- Minimum supported width: 768px
- Optimized for: 768px (tablet), 1024px+ (laptop)

### Touch Targets
- Minimum size: 44x44px on tablet viewport
- Buttons and interactive elements must meet this requirement

### Modal Behavior
- Scrollable if content exceeds viewport
- Modal doesn't overflow screen

---

## Business Rules

### Cycle Management
1. On first app access, auto-create "Cycle 1" with:
   - `name`: "Cycle 1"
   - `status`: "active"
   - `start_date`: today
   - `end_date`: null

2. Only ONE active cycle at any time

3. When archiving a cycle:
   - Set current cycle `status` to "archived"
   - Set current cycle `end_date` to today
   - Copy each report's `development_goals` to `archived_goals`
   - Clear each report's `development_goals`
   - Create new cycle with user-provided name, `status`: "active", `start_date`: today

### Report Management
1. Reports persist across cycles
2. Deleting a report cascades to:
   - All entries for that report
   - All archived_goals for that report

### Entry Management
1. Entries are associated with both a report AND a cycle
2. Entry type cannot be changed after creation
3. Entries sorted by `created_at` DESC (newest first)
4. Position in list doesn't change when edited (based on created_at)

---

## SBI Framework Reference

The Situation-Behavior-Impact framework structures clear, actionable feedback:

- **Situation**: Anchor the feedback in a specific time and place.
  *"During yesterday's design review..."*

- **Behavior**: Describe what the person did, factually and specifically.
  *"You interrupted the PM twice while they were explaining requirements..."*

- **Impact**: Explain the consequence of the behavior.
  *"This made it harder for the team to understand the full context, and the PM seemed frustrated."*

This structure separates observation from interpretation and focuses on changeable behaviors rather than personality traits.

---

## Entry Type Summary

| Type | Required Fields | Optional Fields | Badge Color |
|------|-----------------|-----------------|-------------|
| Feedback | feedback_type, situation, behavior, impact | notes | Blue |
| Accomplishment | notes (description) | - | Green |
| Kudos | notes (description) | link | Yellow |
| Notes | notes (content) | - | Gray |
| Career Conversation | notes (content) | - | Purple |
| Third-Party Feedback | provider_name, notes (content) | - | Orange |
