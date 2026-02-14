---
status: pending
priority: p3
issue_id: "008"
tags: [code-review, security]
dependencies: []
---

# No URL Validation on Webhook URLs (SSRF Risk)

## Problem Statement

`callN8nWebhook` in `src/lib/ai.ts` uses env var URLs directly without validation. If env vars are misconfigured to point to internal services, it could be an SSRF vector. Risk is low since env vars are server-controlled.

## Findings

- **Location:** `src/lib/ai.ts:callN8nWebhook()`
- URLs come from env vars (server-controlled, not user input)
- Actual risk is low but defense-in-depth suggests validation

## Proposed Solutions

### Option A: Validate URL starts with https:// (Recommended)
Simple check that webhook URLs use HTTPS protocol.

**Pros:** Prevents accidental misconfiguration, minimal code
**Cons:** Slightly more code
**Effort:** Trivial
**Risk:** None

## Acceptance Criteria

- [ ] `callN8nWebhook` validates URL protocol is HTTPS
- [ ] Throws descriptive error for invalid URLs

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-14 | Created from code review | Security agent flagged as medium, downgraded to P3 |
