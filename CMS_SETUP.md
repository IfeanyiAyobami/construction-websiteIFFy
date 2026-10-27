# KONSADEM Associates — Content Studio (Phase 1)

## What is included
- `/admin` protected login, responsive dashboard, editor for projects, posts, team, services, testimonials; drafts/publish/archive, search, image upload, gallery URLs, deletion confirmation.
- `/api/admin/*` server-side editor checks and allowlisted CRUD; Supabase RLS as the security boundary. Admin-only deletion enforced by database RLS.
- `/projects`, `/insights`, `/team`, `/services` automatically display published CMS records when available, otherwise retain the original illustrative design. The homepage adds featured published projects and latest blog posts. Existing GSAP animations, navigation and design remain in the source.
- `/work/[slug]` project case studies and `/journal/[slug]` blog detail pages with metadata.

## Setup
1. Create a Supabase project. In SQL Editor, execute `supabase/001_monument_cms.sql` once on a new project. It creates tables, indexes, RLS policies, editor roles and a public image bucket.
2. Under Supabase **Authentication > Users**, create a staff account. Copy its UUID and run:
   `insert into public.cms_editors(user_id,role) values ('REPLACE_WITH_REAL_USER_UUID','admin');`
3. Copy `.env.example` to `.env.local`, fill in Supabase Project URL and anon/publishable key. **Never put the service-role key in a NEXT_PUBLIC_ variable.**
4. `npm install` then `npm run dev`; open `http://localhost:3000/admin` and sign in with the staff account.
5. In Netlify > Site configuration > Environment variables, add the same two values, then deploy from GitHub. Test production login, uploading and publishing.
6. Set up email confirmations and recovery in Supabase Authentication settings, configure your site URL and redirect allowlist, enable MFA for staff if available, and use a strong unique password.

## Security and production notes
- Only allowlisted content types and columns are writable through the API; RLS independently enforces who can edit. Public API only returns published rows. Uploaded files have an 8 MB size limit and a MIME allowlist. Use only images you have permission to publish.
- Cookie sessions are HTTP-only, Secure in production, SameSite=Lax. Access token expiration is refreshed via the server refresh route when the dashboard makes an authenticated request. For longer-lived server-rendered sessions, consider migrating to the maintained `@supabase/ssr` SDK and middleware/proxy session refresh.
- **Known scope limits**: demo homepage projects and testimonials remain as illustrative content alongside CMS additions; the original contact form is still demo-only; there is no rich-text HTML editor, version history, audit log, spam-protected enquiry inbox, rate-limited login proxy, advanced image transformations, scheduling, or backup automation. Do not describe those as implemented.
- The content body is plain text, not interpreted as HTML, preventing stored XSS from arbitrary pasted markup. Images are publicly viewable. The gallery field accepts one image URL per line.
- To go live, replace or remove all fictional project/team/testimonial content, placeholder email and phone, and illustrative stats. Obtain approval for all client quotes and staff portraits.
- Test: unauthorized admin access, editor vs admin deletion, RLS with anon key, expired sessions, mobile layout, upload size/type, duplicate slugs, publish/unpublish, broken image links, deployment build.
- This starter uses PostgREST directly to avoid adding a new runtime dependency. For a larger team, consider the Supabase JS/SSR SDK, admin activity logs, revisions, backups, and a rich-text editor with sanitization.
