---
status: pending
priority: p2
issue_id: "006"
tags: [code-review, security]
dependencies: []
---

# Production N8N Hostname Committed to CLAUDE.md

## Problem Statement

The production N8N webhook hostname (`n8n.mondo.surf`) is committed to CLAUDE.md. While not a secret, it exposes infrastructure details in a public/shared file.

## Findings

- **Location:** `CLAUDE.md` - Environment Variables section
- Contains full production URLs like `https://n8n.mondo.surf/webhook/...`
- Should use placeholder URLs instead

## Proposed Solutions

### Option A: Replace with placeholder URLs (Recommended)
Use `https://your-n8n-instance.com/webhook/...` pattern in CLAUDE.md.

**Pros:** No infrastructure exposure, still documents the pattern
**Cons:** None
**Effort:** Trivial
**Risk:** None

## Acceptance Criteria

- [ ] CLAUDE.md uses placeholder URLs for N8N webhooks
- [ ] .env.example (if exists) also uses placeholders

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-14 | Created from code review | Security agent flagged |
