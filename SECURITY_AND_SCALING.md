# MONUMENT CMS: Security and scaling checklist

This is a hardened **development baseline**, not a security-certified production release.

## Added in this revision
- Same-origin / Fetch Metadata checks on all cookie-authenticated write endpoints.
- Request size limits and JSON Content-Type checks on mutations.
- Admin-only delete enforcement at API level (also enforced by Supabase RLS).
- HTTPS-only image URLs and stricter text/gallery size limits.
- Response security headers and optional PostgreSQL indexes.

## Before production
1. Apply `supabase/001_monument_cms.sql`, then `supabase/002_cms_performance.sql`.
2. Create Supabase users manually, assign least-privilege roles, and enable MFA where available.
3. Configure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Netlify; NEVER expose a service-role key.
4. Add WAF or edge rate limiting for `/api/admin/session` and `/api/admin/upload`; these routes do **not** yet have distributed rate limiting.
5. Implement proper audit logging, backups with restore drills, monitoring, image processing, and admin MFA before client production use.
6. Add end-to-end browser tests and a dependency vulnerability scan; neither is claimed to have passed here.
7. Avoid rendering arbitrary CMS HTML unsanitized; use a safe Markdown/rich-text renderer.
8. Set strict CSP after inventorying video, fonts, and external resources, so existing animation/media isn't broken.
9. Review RLS and storage policies in Supabase using separate anonymous, editor and admin accounts.
10. Validate all existing page content against the CMS schema before removing static fallbacks.

## Architecture notes
For high traffic: use CDN caching and selective Next.js revalidation, not per-request uncached CMS queries. For growing editorial teams: add revisions, approvals, scheduled publishing, asset cleanup and soft-delete.
