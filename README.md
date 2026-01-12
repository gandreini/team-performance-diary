# Team Performance Diary

A web application for tracking team member performance through reports and entries organized in cycles.

## Features

- Create and manage team member reports
- Add performance entries with markdown support
- Organize work in cycles (time periods)
- Archive completed cycles
- Backup and restore data
- Basic authentication protection

## Setup

### Prerequisites
- Node.js 18+
- npm

### Installation

```bash
npm install
```

### Database Setup

**Local development:**
```bash
npm run db:push
```

**Production (Turso):**
1. Create a Turso database
2. Set environment variables:
   ```
   DATABASE_URL=libsql://your-db.turso.io
   DATABASE_AUTH_TOKEN=your-token
   ```
3. Push schema: `npm run db:push`

### Environment Variables

Create a `.env` file:
```
DATABASE_URL=file:local.db
DATABASE_AUTH_TOKEN=
BASIC_AUTH_USER=admin
BASIC_AUTH_PASS=yourpassword
```

## Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deployment

Deployed on Vercel with Turso database.

```bash
vercel --prod
```

Set environment variables in Vercel dashboard.
