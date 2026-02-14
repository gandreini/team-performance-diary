# Team Performance Diary

A self-hosted web application for engineering managers and team leads to track team member performance through structured feedback, development goals, and review cycles.

## Why This Exists

Performance reviews shouldn't be a scramble to remember what happened over the last quarter. Team Performance Diary lets you continuously log feedback, accomplishments, and development notes throughout a review cycle so that when it's time for a formal review, everything is already documented.

## Features

- **Review Cycles** — Organize entries into time-based cycles (e.g., Q1 2025, H2 2025). Archive cycles when complete to snapshot goals and start fresh.
- **Team Member Reports** — Create a report for each team member with structured development goals.
- **Rich Entry Types** — Log different kinds of performance data:
  - **Feedback** (positive or constructive) using the SBI model (Situation, Behavior, Impact)
  - **Accomplishments** — Notable achievements worth highlighting
  - **Kudos** — Peer recognition and praise
  - **Career Conversations** — Notes from 1:1s and growth discussions
  - **Third-Party Feedback** — Input received from other colleagues
  - **General Notes** — Anything else worth tracking
- **Development Goals** — Track structured goals per team member, link entries to goals, and snapshot goals when archiving cycles.
- **AI-Powered Assistance** — Optional integration with n8n webhooks for:
  - Text improvement suggestions with inline diff (accept/reject)
  - Auto-generated report summaries per cycle
- **Markdown Support** — Write entries and goals using Markdown with live preview.
- **Backup & Restore** — Full JSON export/import of all data.
- **Basic Auth** — Simple username/password protection for your instance.
- **Responsive Design** — Two-column layout on wide screens, single column on mobile.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Next.js 16](https://nextjs.org/) (App Router) |
| Language | TypeScript |
| Database | SQLite via [Drizzle ORM](https://orm.drizzle.team/) + [Turso](https://turso.tech/) (libSQL) |
| Styling | [Tailwind CSS 4](https://tailwindcss.com/) |
| Testing | [Vitest](https://vitest.dev/) (125+ tests) |
| AI Integration | [n8n](https://n8n.io/) webhooks (optional) |
| Deployment | [Vercel](https://vercel.com/) |

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
git clone https://github.com/your-username/team-performance-diary.git
cd team-performance-diary
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```env
# Database (local SQLite for development)
DATABASE_URL=file:local.db
DATABASE_AUTH_TOKEN=

# Basic authentication
BASIC_AUTH_USER=admin
BASIC_AUTH_PASS=yourpassword

# AI features (optional — app works fine without these)
N8N_IMPROVE_TEXT_WEBHOOK_URL=https://your-n8n.com/webhook/tpd-improve-text
N8N_REPORT_SUMMARY_WEBHOOK_URL=https://your-n8n.com/webhook/tpd-report-summary
N8N_WEBHOOK_AUTH_TOKEN=your-token
```

### Database Setup

```bash
npm run db:push
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Database

The app uses SQLite locally and [Turso](https://turso.tech/) (a libSQL edge database) in production.

| Command | Description |
|---------|-------------|
| `npm run db:push` | Push schema to database |
| `npm run db:generate` | Generate migrations |
| `npm run db:migrate` | Run migrations |
| `npm run db:studio` | Open Drizzle Studio (visual DB browser) |
| `npm run db:seed` | Seed database with sample data |

### Schema Overview

```
cycles          — Review periods (active/archived)
reports         — One per team member
entries         — Performance entries linked to a report + cycle
development_goals — Structured goals per report
entry_goals     — Links entries to development goals
archived_goals  — Goal snapshots when a cycle is archived
report_summaries — AI-generated summaries per report per cycle
```

## Testing

```bash
npm test              # Watch mode
npm run test:run      # Single run
npm run test:coverage # With coverage report
```

Tests cover library functions and API routes with mocked database operations.

## Production Deployment

The app is designed for deployment on Vercel with a Turso database:

1. Create a [Turso](https://turso.tech/) database
2. Set `DATABASE_URL` and `DATABASE_AUTH_TOKEN` in your Vercel environment
3. Set `BASIC_AUTH_USER` and `BASIC_AUTH_PASS`
4. Deploy:

```bash
vercel --prod
```

## AI Features (Optional)

The AI integration is powered by [n8n](https://n8n.io/) webhooks — you can wire up any LLM backend you prefer. Two features are supported:

- **Text Improvement** — A sparkle button appears next to text fields. It sends the text to your n8n webhook and shows an inline diff so you can accept or reject the suggestion.
- **Report Summaries** — Generate an AI summary for a team member's performance in a given cycle, based on all their entries and goals.

Both features degrade gracefully — the app is fully functional without them.

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # REST API routes
│   │   ├── cycles/        # Cycle CRUD
│   │   ├── reports/       # Report CRUD
│   │   ├── entries/       # Entry CRUD
│   │   ├── ai/            # AI text improvement
│   │   └── backup/        # Backup/restore
│   ├── cycles/[id]/       # Cycle detail page
│   ├── reports/[id]/      # Report detail page
│   └── settings/          # Settings & backup page
├── components/            # React UI components
├── db/                    # Drizzle schema & connection
└── lib/                   # Business logic layer
```

## License

This project is licensed under the GNU Affero General Public License v3.0. See the [LICENSE](LICENSE) file for details.
