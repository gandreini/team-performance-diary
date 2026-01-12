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
    └── archived-goals.ts
```

## Environment Variables
```
DATABASE_URL=libsql://your-db.turso.io    # Turso database URL
DATABASE_AUTH_TOKEN=your-token             # Turso auth token
BASIC_AUTH_USER=username                   # Basic auth username
BASIC_AUTH_PASS=password                   # Basic auth password
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
