-- Run once after 003, 004 and 005. Review deadlines and per-user notifications.
begin;
create table public.dms_review_deadlines (
 document_id uuid primary key references public.dms_documents(id) on delete cascade,
 due_on date not null,
 updated_at timestamptz not null default now()
);
alter table public.dms_review_deadlines enable row level security;
create policy "Staff read review deadlines" on public.dms_review_deadlines for select to authenticated using (public.dms_role() is not null);
grant select on public.dms_review_deadlines to authenticated;
create function public.dms_set_review_deadline(doc_id uuid, deadline date) returns void language plpgsql security definer set search_path='' as $$
declare doc public.dms_documents;
begin
 if public.dms_role() is null then raise exception 'Workspace access required'; end if;
 select * into doc from public.dms_documents where id=doc_id for update;
 if not found or (doc.uploaded_by <> auth.uid() and public.dms_role() <> 'admin') then raise exception 'Document author or administrator required'; end if;
 if doc.status <> 'draft' then raise exception 'Set the deadline before submitting the draft'; end if;
 if deadline is null then delete from public.dms_review_deadlines where document_id=doc_id;
 else insert into public.dms_review_deadlines(document_id,due_on) values(doc_id,deadline)
 on conflict(document_id) do update set due_on=excluded.due_on,updated_at=now(); end if;
end $$;
revoke all on function public.dms_set_review_deadline(uuid,date) from public;
grant execute on function public.dms_set_review_deadline(uuid,date) to authenticated;
-- Reject new assignments to staff whose workspace access is disabled.
create function public.dms_active_reviewer_guard() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if new.reviewer_id is not null and (tg_op='INSERT' or new.reviewer_id is distinct from old.reviewer_id or (new.status='in_review' and old.status is distinct from new.status)) and not exists(select 1 from public.dms_members where user_id=new.reviewer_id and active and role in ('admin','reviewer')) then
  raise exception 'Choose an active reviewer';
 end if;
 return new;
end $$;
create trigger dms_active_reviewer_guard before insert or update on public.dms_documents for each row execute function public.dms_active_reviewer_guard();
create table public.dms_notifications (
 id bigint generated always as identity primary key,
 recipient_id uuid not null references public.dms_members(user_id),
 document_id uuid not null references public.dms_documents(id),
 message text not null,
 created_at timestamptz not null default now(),
 read_at timestamptz
);
alter table public.dms_notifications enable row level security;
create policy "Staff read own notifications" on public.dms_notifications for select to authenticated using (recipient_id=auth.uid() and public.dms_role() is not null);
grant select on public.dms_notifications to authenticated;
create function public.dms_notify_document() returns trigger language plpgsql security definer set search_path='' as $$
begin
 if tg_op='UPDATE' and new.status='in_review' and old.status is distinct from new.status and new.reviewer_id is not null then
  insert into public.dms_notifications(recipient_id,document_id,message) values(new.reviewer_id,new.id,'A document is ready for your review.');
 elsif tg_op='UPDATE' and new.status in ('approved','revision_requested') and old.status is distinct from new.status then
  insert into public.dms_notifications(recipient_id,document_id,message) values(new.uploaded_by,new.id,case when new.status='approved' then 'Your document was approved.' else 'A revision was requested for your document.' end);
 end if;
 return new;
end $$;
create trigger dms_notify_document after update on public.dms_documents for each row execute function public.dms_notify_document();
create function public.dms_mark_notification_read(notification_id bigint) returns void language plpgsql security definer set search_path='' as $$
begin
 if public.dms_role() is null then raise exception 'Workspace access required'; end if;
 update public.dms_notifications set read_at=coalesce(read_at,now()) where id=notification_id and recipient_id=auth.uid();
end $$;
revoke all on function public.dms_mark_notification_read(bigint) from public;
grant execute on function public.dms_mark_notification_read(bigint) to authenticated;
commit;
