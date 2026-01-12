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

### Files
- `src/app/` - All pages and API routes
- `src/components/` - UI components
- `src/db/` - Database schema and connection
- `src/lib/` - Business logic
- `src/middleware.ts` - Basic auth protection
- `drizzle.config.ts` - Database configuration
