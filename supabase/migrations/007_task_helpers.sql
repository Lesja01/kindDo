alter table public.dream_tasks
  add column if not exists helper_id uuid references public.users(id) on delete set null,
  add column if not exists status text not null default 'OPEN' check (status in ('OPEN', 'TAKEN', 'COMPLETED'));

alter table public.dream_tasks
  drop constraint if exists dream_task_helper_not_author;

alter table public.dream_tasks
  add constraint dream_task_helper_not_author check (helper_id is null or helper_id <> author_id);

create index if not exists dream_tasks_helper_idx on public.dream_tasks(helper_id);
create index if not exists dream_tasks_status_idx on public.dream_tasks(status);

alter table public.chats
  add column if not exists task_id uuid references public.dream_tasks(id) on delete cascade;

alter table public.chats
  drop constraint if exists chats_dream_id_key;

create unique index if not exists chats_legacy_dream_unique_idx
  on public.chats(dream_id)
  where task_id is null;

create unique index if not exists chats_task_unique_idx
  on public.chats(task_id)
  where task_id is not null;

drop policy if exists "Dream participants read tasks" on public.dream_tasks;
create policy "Dream participants read tasks" on public.dream_tasks for select using (
  exists (
    select 1 from public.dreams
    where dreams.id = dream_tasks.dream_id
      and (
        dreams.visibility = 'public'
        or auth.uid() = dreams.author_id
        or auth.uid() = dreams.helper_id
        or auth.uid() = dream_tasks.helper_id
      )
  )
);

create or replace function public.claim_dream_task(target_task_id uuid)
returns public.chats
language plpgsql
security definer
set search_path = public
as $$
declare
  claimed_task public.dream_tasks;
  target_dream public.dreams;
  new_chat public.chats;
begin
  update public.dream_tasks
    set status = 'TAKEN', helper_id = auth.uid()
    where id = target_task_id
      and status = 'OPEN'
      and helper_id is null
      and author_id <> auth.uid()
    returning * into claimed_task;

  if claimed_task.id is null then
    raise exception 'Task is not available to claim';
  end if;

  select * into target_dream
    from public.dreams
    where id = claimed_task.dream_id
      and visibility = 'public'
      and status <> 'COMPLETED';

  if target_dream.id is null then
    raise exception 'Dream is not available';
  end if;

  update public.dreams
    set status = 'TAKEN',
        helper_id = coalesce(helper_id, auth.uid())
    where id = target_dream.id and (status = 'OPEN' or helper_id is null);

  insert into public.chats (dream_id, task_id, user_1, user_2)
    values (target_dream.id, claimed_task.id, target_dream.author_id, auth.uid())
    returning * into new_chat;

  return new_chat;
end;
$$;
