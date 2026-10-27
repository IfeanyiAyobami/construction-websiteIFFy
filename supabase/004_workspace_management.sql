-- Run after 003. Adds project/client metadata and a reporting capacity setting.
begin;
create table public.dms_clients(
 id uuid primary key default gen_random_uuid(),
 name text not null check(length(trim(name)) between 1 and 200),
 email text not null default '' check(length(email)<=254),
 phone text not null default '' check(length(phone)<=80),
 created_at timestamptz not null default now());
create table public.dms_projects(
 id uuid primary key default gen_random_uuid(),
 name text not null unique check(length(trim(name)) between 1 and 200),
 location text not null default '' check(length(location)<=200),
 phase text not null default 'Design development' check(length(phase)<=200),
 progress integer not null default 0 check(progress between 0 and 100),
 client_id uuid references public.dms_clients(id),
 image_url text not null default '' check(image_url='' or image_url ~ '^https://'),
 featured boolean not null default false,
 created_at timestamptz not null default now());
create table public.dms_settings(
 id boolean primary key default true check(id),
 workspace_name text not null default 'KONSADEM ASSOCIATES LTD' check(length(trim(workspace_name)) between 1 and 200),
 storage_capacity_bytes bigint not null default 0 check(storage_capacity_bytes between 0 and 1073741824000000));
insert into public.dms_settings(id) values(true);
alter table public.dms_clients enable row level security;
alter table public.dms_projects enable row level security;
alter table public.dms_settings enable row level security;
create policy "Staff read clients" on public.dms_clients for select to authenticated using((select public.dms_role()) is not null);
create policy "Admins manage clients" on public.dms_clients for all to authenticated using((select public.dms_role())='admin') with check((select public.dms_role())='admin');
create policy "Staff read projects" on public.dms_projects for select to authenticated using((select public.dms_role()) is not null);
create policy "Admins manage projects" on public.dms_projects for all to authenticated using((select public.dms_role())='admin') with check((select public.dms_role())='admin');
create policy "Staff read settings" on public.dms_settings for select to authenticated using((select public.dms_role()) is not null);
create policy "Admins update settings" on public.dms_settings for update to authenticated using((select public.dms_role())='admin') with check((select public.dms_role())='admin');
grant select,insert,update on public.dms_clients,public.dms_projects to authenticated;
grant select,update on public.dms_settings to authenticated;
-- A project's name is the immutable document folder key. Rename only before files exist.
create function public.dms_project_name_guard() returns trigger language plpgsql set search_path='' as $$
begin
 if new.name<>old.name and exists(select 1 from public.dms_documents where project=old.name) then
 raise exception 'Project contains documents; its name cannot change. Update its other details instead.';
 end if;
 return new;
end $$;
create trigger dms_project_name_guard before update on public.dms_projects for each row execute function public.dms_project_name_guard();
-- Restore the intended invariant: the uploader cannot be assigned as their own reviewer.
alter table public.dms_documents add constraint dms_distinct_reviewer check(reviewer_id is null or reviewer_id<>uploaded_by) not valid;
-- NOT VALID preserves existing installations; new/updated rows must obey the constraint.
-- Distinguish embedded previews from explicit download actions in the audit.
create or replace function public.dms_log_access(doc_id uuid,event text) returns void language plpgsql security definer set search_path='' as $$begin
 if public.dms_role() is null or event not in ('download','shared_link','preview') or not exists(select 1 from public.dms_documents where id=doc_id) then raise exception 'Access denied';end if;
 insert into public.dms_activity(document_id,actor_id,action) values(doc_id,auth.uid(),event);
end $$;
revoke all on function public.dms_log_access(uuid,text) from public;
grant execute on function public.dms_log_access(uuid,text) to authenticated;
commit;
