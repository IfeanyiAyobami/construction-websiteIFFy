-- Run once after 003 and 004. Adds account management for workspace administrators.
begin;
alter table public.dms_members add column if not exists active boolean not null default true;
create or replace function public.dms_role() returns text language sql stable security definer set search_path='' as $$
 select role from public.dms_members where user_id=(select auth.uid()) and active=true
$$;
create table public.dms_staff_audit(
 id bigint generated always as identity primary key,
 actor_id uuid references auth.users(id),
 subject_id uuid not null references auth.users(id),
 action text not null,
 old_role text, new_role text, old_active boolean, new_active boolean,
 created_at timestamptz not null default now()
);
alter table public.dms_staff_audit enable row level security;
create policy "Admins read staff audit" on public.dms_staff_audit for select to authenticated using((select public.dms_role())='admin');
grant select on public.dms_staff_audit to authenticated;
-- Insert/update remain subject to these RLS checks; no client DELETE grant.
create policy "Admins add staff" on public.dms_members for insert to authenticated with check((select public.dms_role())='admin');
create policy "Admins update staff" on public.dms_members for update to authenticated using((select public.dms_role())='admin') with check((select public.dms_role())='admin');
grant insert,update on public.dms_members to authenticated;
create function public.dms_staff_guard() returns trigger language plpgsql security definer set search_path='' as $$
declare actor uuid:=auth.uid();
begin
 if actor is null and session_user in ('postgres','supabase_admin') then return new; end if;
 if actor is null or public.dms_role() is distinct from 'admin' then raise exception 'Active workspace administrator required';end if;
 if tg_op='UPDATE' then
  if new.user_id<>old.user_id then raise exception 'Staff user ID cannot be changed';end if;
  if new.user_id=actor and (new.active=false or new.role<>'admin') then raise exception 'You cannot deactivate or remove your own administrator access';end if;
  -- Serialize administrator changes and re-read remaining active administrators.
  if old.role='admin' and old.active and (new.role<>'admin' or not new.active) then
   perform pg_advisory_xact_lock(hashtextextended('konsadem-admin-guard',0));
   if not exists(select 1 from public.dms_members where user_id<>old.user_id and role='admin' and active) then
    raise exception 'At least one active workspace administrator must remain';
   end if;
  end if;
 end if;
 return new;
end $$;
create trigger dms_staff_guard before insert or update on public.dms_members for each row execute function public.dms_staff_guard();
create function public.dms_staff_audit_write() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if tg_op='INSERT' then
  insert into public.dms_staff_audit(actor_id,subject_id,action,new_role,new_active) values(auth.uid(),new.user_id,'membership_added',new.role,new.active);
 elsif new.role is distinct from old.role or new.active is distinct from old.active then
  insert into public.dms_staff_audit(actor_id,subject_id,action,old_role,new_role,old_active,new_active) values(auth.uid(),new.user_id,'access_updated',old.role,new.role,old.active,new.active);
 end if;
 return new;
end $$;
create trigger dms_staff_audit_write after insert or update on public.dms_members for each row execute function public.dms_staff_audit_write();

create function public.dms_log_staff_reset(subject uuid) returns void language plpgsql security definer set search_path='' as $$
begin
 if public.dms_role() is distinct from 'admin' or not exists(select 1 from public.dms_members where user_id=subject) then raise exception 'Workspace administrator required'; end if;
 insert into public.dms_staff_audit(actor_id,subject_id,action) values(auth.uid(),subject,'password_reset_requested');
end $$;
revoke all on function public.dms_log_staff_reset(uuid) from public;
grant execute on function public.dms_log_staff_reset(uuid) to authenticated;
commit;
