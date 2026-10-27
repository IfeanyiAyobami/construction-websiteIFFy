# KONSADEM - deployable Next.js application

This source includes the rebranded website, website CMS and authenticated document workspace. It is not a static prototype. There is no demo route.

## Run
Use Node.js 22 LTS.
1. Copy .env.example to .env.local and enter your Supabase URL and publishable/anon key.
2. Run npm ci, then npm run dev.
3. Open http://localhost:3000, /admin for the website CMS, or /workspace for documents.
4. Run npm run check and npm run build. Start production with npm start.

Netlify can deploy this Next.js project from Git with the included netlify.toml. Configure the Supabase variables and exact deployed SITE_URL. Never commit .env.local, node_modules, .next or private-documents.

## Database and access
For a new project run SQL migrations 001, 002, 003, 004 from supabase/ in order, once each. For an existing installation run only missing migrations; keep its data.

Create staff through Supabase Authentication. Add uploader/reviewer/admin UUIDs to dms_members with roles member, reviewer or admin. Website CMS permissions are separate in cms_editors. Use different uploader and reviewer accounts.

## Import your supplied PDFs privately
Both unchanged PDFs are in private-documents/, outside public/. Set DMS_IMPORT_EMAIL and DMS_IMPORT_PASSWORD in .env.local to the uploader account. Optionally set a different DMS_IMPORT_REVIEWER_UUID.

Run npm run import:documents. It uploads the originals into the private konsadem-documents bucket, registers drafts and skips identical imports on repeat runs. It uses ordinary staff permissions, never a service-role key. It never approves a drawing automatically. Remove the importer password afterwards.

Project folders derive from document records. Administrators can add project details and clients in the workspace.

## Connected functionality
Reference-matched workspace/review layout and larger text; real records and counts; signed PDF/image previews; private upload progress; reviewer assignment; draft submission; approval/revision request and notes; retained versions; audit history; downloads and 60-second bearer sharing links; admin project/client editing and reporting settings; sign-out; existing website CMS and public-site animations.

## Limits
All enrolled workspace staff can read all documents. Project-specific permissions and external collaborators are not implemented. Do not enrol clients as staff to share selected projects.

Storage reporting totals up to 1,000 loaded revisions using a manually configured capacity target. This is not a billing report, a purchased quota or an upload limit. Activity loads the latest 100 events.

Office/CAD files download for native applications. PDF/image previews are included. Drawing annotations, CAD rendering, invitations, outbound notifications and malware scanning are not included.

Public portfolio copy inherited from the original website is illustrative. Replace with verified content in the CMS before launch.

## Verification
Local checks do not configure hosted services. Validate actual Supabase sign-in and storage using separate uploader, assigned reviewer, admin and unauthorised accounts. Test upload, submit, revision request with notes, new revision, approval, retained history, expired shares, logout and direct REST permission denials. Check desktop/mobile layouts and CMS publishing.

No remote database or Netlify production website was changed while preparing this package.

## Staff accounts and workspace administration

Run migration 005_staff_access.sql after 003 and 004. Staff access is managed inside the workspace Team page; /workspace/staff is a direct link to the same page and requires an authorised login. A hidden menu link does not protect a page; authentication, membership and database row policies do.

First create the initial administrator in Supabase Authentication (or reuse your existing website CMS account), then bootstrap the workspace membership in the Supabase SQL Editor:

  insert into public.dms_members (user_id, display_name, role, active)
  select id, 'Administrator name', 'admin', true
  from auth.users where lower(email) = lower('your-email@example.com')
  on conflict (user_id) do update
    set display_name = excluded.display_name, role = 'admin', active = true
  returning user_id, display_name, role, active;

Replace the example name/email. An empty result means no matching Authentication account exists. This SQL only changes the selected workspace membership, not the CMS role.

For the authenticated admin page to create or reset Supabase Auth credentials, set SUPABASE_SERVICE_ROLE_KEY as a server-only runtime environment variable. Do not use a NEXT_PUBLIC prefix or commit the value. It is used only by server code after checking active workspace administrator membership. On Netlify, configure it as a secret environment variable. The workspace works without that key for document operations; account creation, linking and password resets require it.

The administrator can create an account with a temporary password, link an existing Auth UUID after matching its email, change workspace roles, disable/re-enable workspace access, and reset a workspace member's password. Account creation confirms the email administratively and sends no email. Share the displayed password privately. Passwords are not stored by the application or returned in API responses; Supabase Auth stores its password hash. First-login password changes are not enforced by this release.

Resetting an existing Supabase Auth password affects all applications using that same account, including the website CMS. Disabling workspace membership does not disable an independent CMS role. A previously issued 60-second sharing URL can remain usable until it expires. Staff changes and reset requests are recorded in dms_staff_audit; password values are never included.

## Add the two drawing examples from the workspace
Sign in as a workspace administrator and use **Add example drawings** on Overview. This creates the Nice Terrace and 4 Bedroom Residence project records when missing and uploads the original PDFs as private drafts. Choose a different active reviewer before submitting a draft for review. The action skips matching existing documents when repeated. It uses the signed-in administrator's permissions and does not need a password stored in an environment variable.

The example PDFs remain outside public/ and are served only through an administrator-authorized endpoint. For a Git-based deployment, private-documents/ is excluded from Git by default, so the endpoint will report the drawings unavailable unless the server deployment includes those two files. Only include them in a private repository and deployment if all repository and deployment operators are authorized to access the originals; otherwise use the private importer locally instead. The deployment trace is configured to include them when available at build time. No example drawings are imported automatically.

## Review deadlines and notifications
Run `supabase/006_workspace_notifications.sql` once in the Supabase SQL Editor, after 003, 004 and 005. The document owner or an administrator can save a due date while the revision is a draft. Submission notifies the assigned reviewer; an approval or revision request notifies the uploader. Notifications are in-app, private to their recipient, and can be marked read by opening them. The workspace does not send emails or schedule reminders. Only active reviewers can be newly assigned or receive a newly submitted review.

PDFs use the browser's native PDF viewer for page navigation, zoom, and download; support varies by browser. Private preview links are short lived; reopen the document if the preview expires. Other document formats must be opened in their native application. The dashboard's storage count is based on up to 1,000 loaded document revisions and the capacity entered in settings is an administrative reporting target, not a hard storage limit.

To verify the complete workflow, create a separate active reviewer account, add the examples as drafts while signed in as the administrator, assign the reviewer, and submit a drawing. Sign in as that reviewer to request a revision or approve; the uploader cannot approve their own revision. Repeat on the actual hosted site after deploying and configuring Supabase. Do not use live project drawings as a simulation if they are intended for construction.
