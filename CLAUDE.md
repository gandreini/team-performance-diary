# Team Performance Diary - Project Guide

## Overview
A Next.js application for tracking team member performance through reports and entries organized in cycles.

## Tech Stack
- **Framework:** Next.js 16 with App Router
- **Database:** Drizzle ORM with libSQL/Turso
- **Styling:** Tailwind CSS 4
- **Language:** TypeScript

## Project Structure
```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   │   ├── cycles/        # Cycle management
│   │   ├── reports/       # Report CRUD
│   │   ├── entries/       # Entry CRUD
│   │   ├── backup/        # Backup/restore
│   │   ├── ai/            # AI text improvement endpoint
│   │   └── archived-goals/
│   ├── cycles/[id]/       # Cycle detail page
│   ├── reports/[id]/      # Report detail page
│   └── settings/          # Settings page
├── components/            # React components
├── db/                    # Database schema and connection
│   ├── schema.ts          # Drizzle schema definitions
│   └── index.ts           # DB client setup
└── lib/                   # Business logic
    ├── cycles.ts
    ├── reports.ts
    ├── entries.ts
    ├── archived-goals.ts
    ├── ai.ts               # N8N webhook callers (improveText, generateReportSummary)
    └── report-summaries.ts # DB operations for AI summaries
```

## Environment Variables
```
DATABASE_URL=libsql://your-db.turso.io    # Turso database URL
DATABASE_AUTH_TOKEN=your-token             # Turso auth token
BASIC_AUTH_USER=username                   # Basic auth username
BASIC_AUTH_PASS=password                   # Basic auth password
N8N_IMPROVE_TEXT_WEBHOOK_URL=https://n8n.mondo.surf/webhook/tpd-improve-text
N8N_REPORT_SUMMARY_WEBHOOK_URL=https://n8n.mondo.surf/webhook/tpd-report-summary
N8N_WEBHOOK_AUTH_TOKEN=your-token         # Optional Bearer token for N8N webhooks
```

## Database
- Uses Drizzle ORM with libSQL
- Local development: SQLite file (`file:local.db`)
- Production: Turso cloud database

### Commands
- `npm run db:push` - Push schema to database
- `npm run db:studio` - Open Drizzle Studio
- `npm run db:generate` - Generate migrations
- `npm run db:migrate` - Run migrations

## Key Patterns
- API routes use Next.js Route Handlers
- Database operations in `src/lib/` files
- Components use client-side rendering where needed
- Markdown support via react-markdown

## Testing
- **Framework:** Vitest with mocked database operations
- **Scope:** Library functions and API routes (125 tests)
- Tests are excluded from TypeScript build via `tsconfig.json`

### Test Commands
- `npm test` - Run tests in watch mode
- `npm run test:run` - Run tests once
- `npm run test:coverage` - Run tests with coverage report

### Test Structure
```
src/
├── test/
│   └── setup.ts           # Test setup with db mocks
├── lib/
│   └── __tests__/
│       ├── entries.test.ts
│       ├── cycles.test.ts
│       ├── reports.test.ts
│       ├── ai.test.ts
│       └── report-summaries.test.ts
└── app/api/
    ├── entries/__tests__/route.test.ts
    ├── cycles/__tests__/route.test.ts
    ├── reports/__tests__/route.test.ts
    └── ai/__tests__/route.test.ts
```

## UI Components
- **ScrollArea** - Custom scrollbar component using CSS (`.custom-scrollbar` class)
- **EntryBadge** - Color-coded badges (green: Positive Feedback/Kudos, red: Constructive Feedback)
- **MarkdownEditor** - Supports `fillHeight` prop for dynamic vertical sizing; `aiContext` prop enables built-in AI text improvement
- **ReportCard** - Rectangular cards with user icons in responsive grid layout
- **InlineDiff** - Word-level diff renderer (green additions, red strikethrough removals) with Accept/Reject
- **AiTextImprove** - Wrapper for plain textareas adding a sparkle button for AI text improvement
- **ReportSummary** - Collapsible AI summary section on report detail page (per report+cycle)

## Responsive Layout
- Report detail page uses two-column layout on wide screens (xl: 1280px+)
- Left column (500px): Sticky sidebar with name, AI summary, and development goals
- Right column: Scrollable entries list
- Single column on smaller screens
- Max page width: 1800px
- Home page report cards: Responsive grid (2-6 columns based on screen size)
