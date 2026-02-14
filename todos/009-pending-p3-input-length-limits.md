---
status: pending
priority: p3
issue_id: "009"
tags: [code-review, security, performance]
dependencies: []
---

# No Input Length Limits on AI Text Improvement API

## Problem Statement

The `/api/ai/improve-text` endpoint doesn't validate input length. Very large text payloads could be forwarded to the N8N webhook, potentially causing timeouts or high costs.

## Findings

- **Location:** `src/app/api/ai/improve-text/route.ts`
- No max length check on `text` or `context` fields
- The 30s timeout in `callN8nWebhook` provides some protection

## Proposed Solutions

### Option A: Add reasonable max length validation
Reject requests where `text` exceeds a reasonable limit (e.g., 50,000 chars).

**Pros:** Prevents abuse, fast to implement
**Cons:** Need to pick a sensible limit
**Effort:** Trivial
**Risk:** None

## Acceptance Criteria

- [ ] API validates input length with descriptive 400 error
- [ ] Limit is documented

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-14 | Created from code review | Security and performance agents flagged |
