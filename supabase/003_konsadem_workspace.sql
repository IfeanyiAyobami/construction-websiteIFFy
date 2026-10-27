-- Run AFTER 001 and 002. Separate membership: CMS access does NOT imply DMS access.
begin;
create table if not exists public.dms_members(user_id uuid primary key references auth.users(id),display_name text not null,role text not null default 'member' check(role in ('member','reviewer','admin')));
create or replace function public.dms_role() returns text language sql stable security definer set search_path='' as $$select role from public.dms_members where user_id=(select auth.uid())$$;
revoke all on function public.dms_role() from public;grant execute on function public.dms_role() to authenticated;
alter table public.dms_members enable row level security;
create policy "DMS team directory" on public.dms_members for select to authenticated using((select public.dms_role()) is not null);
create table if not exists public.dms_documents(
 id uuid primary key default gen_random_uuid(), root_id uuid not null, revision integer not null default 1 check(revision>0),
 title text not null check(length(title) between 1 and 200),project text not null check(length(project) between 1 and 200),category text not null default 'General',
 file_path text unique not null,file_name text not null,mime_type text not null,size_bytes bigint not null check(size_bytes between 1 and 52428800),
 uploaded_by uuid not null references public.dms_members(user_id),reviewer_id uuid references public.dms_members(user_id),
 status text not null default 'draft' check(status in ('draft','in_review','approved','revision_requested')),
 review_note text not null default '',reviewed_by uuid references public.dms_members(user_id),reviewed_at timestamptz,
 created_at timestamptz not null default now(),updated_at timestamptz not null default now(),unique(root_id,revision));
create table if not exists public.dms_activity(id bigint generated always as identity primary key,document_id uuid not null references public.dms_documents(id),actor_id uuid not null references auth.users(id),action text not null,created_at timestamptz not null default now());
alter table public.dms_documents enable row level security;alter table public.dms_activity enable row level security;
create policy "DMS members read documents" on public.dms_documents for select to authenticated using((select public.dms_role()) is not null);
create policy "DMS members add revisions" on public.dms_documents for insert to authenticated with check((select public.dms_role()) is not null and uploaded_by=(select auth.uid()));
create policy "DMS workflow updates" on public.dms_documents for update to authenticated using((select public.dms_role()) is not null) with check((select public.dms_role()) is not null);
create policy "DMS members read audit" on public.dms_activity for select to authenticated using((select public.dms_role()) is not null);
-- Trigger enforces workflow even for direct REST/database clients. Approved files are immutable.
create or replace function public.dms_validate() returns trigger language plpgsql security definer set search_path='' as $$
declare actor uuid:=auth.uid(); latest public.dms_documents; stored storage.objects;begin
 if actor is null or public.dms_role() is null then raise exception 'Workspace membership required';end if;
 if tg_op='INSERT' then
  if new.uploaded_by<>actor or new.status<>'draft' then raise exception 'New revisions start as your own draft';end if;
  perform pg_advisory_xact_lock(hashtextextended(new.root_id::text,0));
  select * into latest from public.dms_documents where root_id=new.root_id order by revision desc limit 1;
  if found then
   if latest.uploaded_by<>actor and public.dms_role()<>'admin' then raise exception 'Only the author or document administrator can add a revision';end if;
   if new.revision<>latest.revision+1 then raise exception 'Revision changed. Refresh and retry';end if;
   if new.project<>latest.project then raise exception 'Revisions must remain in the same project';end if;
  elsif new.revision<>1 then raise exception 'First revision must be 1';end if;
  if split_part(new.file_path,'/',1)<>actor::text then raise exception 'Invalid upload owner';end if;
  select * into stored from storage.objects where bucket_id='konsadem-documents' and name=new.file_path;
  if not found then raise exception 'Upload the file before saving its record';end if;
  new.size_bytes:=(stored.metadata->>'size')::bigint;new.mime_type:=coalesce(stored.metadata->>'mimetype','application/octet-stream');
  new.review_note:='';new.reviewed_at:=null;new.reviewed_by:=null;
 else
  if new.id<>old.id or new.root_id<>old.root_id or new.revision<>old.revision or new.title<>old.title or new.project<>old.project or new.category<>old.category or new.file_path<>old.file_path or new.file_name<>old.file_name or new.mime_type<>old.mime_type or new.size_bytes<>old.size_bytes or new.uploaded_by<>old.uploaded_by or new.created_at<>old.created_at then raise exception 'File metadata is immutable. Upload a new revision';end if;
  if old.status='draft' and new.status='draft' and actor=old.uploaded_by then
   new.review_note:=old.review_note;new.reviewed_by:=old.reviewed_by;new.reviewed_at:=old.reviewed_at;
  elsif old.status in ('draft','revision_requested') and new.status='in_review' then
   if new.reviewer_id is distinct from old.reviewer_id then raise exception 'Assign a reviewer before submission';end if;
   if actor<>old.uploaded_by then raise exception 'Only the author can submit';end if;
   if new.reviewer_id is null or new.reviewer_id=actor then raise exception 'Choose a different reviewer';end if;
   new.review_note:='';new.reviewed_by:=null;new.reviewed_at:=null;
  elsif old.status='in_review' and new.status in ('approved','revision_requested') then
   if new.reviewer_id is distinct from old.reviewer_id then raise exception 'Reviewer cannot change during review';end if;
   if actor=old.uploaded_by or (actor<>old.reviewer_id and public.dms_role()<>'admin') or public.dms_role() not in ('admin','reviewer') then raise exception 'Assigned reviewer access required; self approval is not permitted';end if;
   if new.status='revision_requested' and length(trim(new.review_note))=0 then raise exception 'Explain the requested revision';end if;
   new.reviewed_by:=actor;new.reviewed_at:=now();
  else raise exception 'Invalid workflow transition';end if;
 end if;
 if new.reviewer_id is not null and not exists(select 1 from public.dms_members where user_id=new.reviewer_id and role in ('reviewer','admin')) then raise exception 'Invalid reviewer';end if;
 new.updated_at:=now();return new;end $$;
create trigger dms_validate before insert or update on public.dms_documents for each row execute function public.dms_validate();
create or replace function public.dms_audit() returns trigger language plpgsql security definer set search_path='' as $$begin insert into public.dms_activity(document_id,actor_id,action) values(new.id,auth.uid(),case when tg_op='INSERT' then 'Uploaded revision '||new.revision when old.status=new.status then 'Reviewer assigned' else new.status end);return new;end $$;
create trigger dms_audit after insert or update on public.dms_documents for each row execute function public.dms_audit();
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('konsadem-documents','konsadem-documents',false,52428800,array['application/pdf','image/jpeg','image/png','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/vnd.ms-excel','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','application/acad','image/vnd.dwg','application/octet-stream']) on conflict(id) do nothing;
create policy "DMS insert private files" on storage.objects for insert to authenticated with check(bucket_id='konsadem-documents' and (select public.dms_role()) is not null and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy "DMS read registered files" on storage.objects for select to authenticated using(bucket_id='konsadem-documents' and (select public.dms_role()) is not null and (exists(select 1 from public.dms_documents d where d.file_path=name) or (storage.foldername(name))[1]=(select auth.uid())::text));
-- No client UPDATE/DELETE on files; revisions are append-only.
grant select on public.dms_members,public.dms_activity to authenticated;
grant select,insert,update on public.dms_documents to authenticated;
create index if not exists dms_created_idx on public.dms_documents(created_at desc);
create index if not exists dms_review_idx on public.dms_documents(reviewer_id,status);
create or replace function public.dms_log_access(doc_id uuid,event text) returns void language plpgsql security definer set search_path='' as $$begin
 if public.dms_role() is null or event not in ('download','shared_link') or not exists(select 1 from public.dms_documents where id=doc_id) then raise exception 'Access denied';end if;
 insert into public.dms_activity(document_id,actor_id,action) values(doc_id,auth.uid(),event);
end $$;
revoke all on function public.dms_log_access(uuid,text) from public;
grant execute on function public.dms_log_access(uuid,text) to authenticated;
commit;
-- Explicitly grant each staff member access using their Supabase Auth UUID:
-- insert into public.dms_members(user_id,display_name,role) values('USER-UUID','Full name','admin');
-- All workspace members can read all workspace documents. Do not add external collaborators.
