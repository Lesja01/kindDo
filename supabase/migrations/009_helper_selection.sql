drop index if exists public.chats_task_unique_idx;
drop index if exists public.chats_legacy_dream_unique_idx;

create unique index if not exists chats_task_candidate_unique_idx
  on public.chats(task_id, user_2)
  where task_id is not null;

create unique index if not exists chats_dream_candidate_unique_idx
  on public.chats(dream_id, user_2)
  where task_id is null;

create or replace function public.claim_dream(target_dream_id uuid)
returns public.chats
language plpgsql
security definer
set search_path = public
as $$
declare
  target_dream public.dreams;
  existing_chat public.chats;
  new_chat public.chats;
begin
  select * into target_dream
    from public.dreams
    where id = target_dream_id
      and visibility = 'public'
      and status = 'OPEN'
      and helper_id is null
      and author_id <> auth.uid();

  if target_dream.id is null then
    raise exception 'Dream is not available';
  end if;

  select * into existing_chat
    from public.chats
    where dream_id = target_dream.id
      and task_id is null
      and user_2 = auth.uid()
    limit 1;

  if existing_chat.id is not null then
    return existing_chat;
  end if;

  insert into public.chats (dream_id, user_1, user_2)
    values (target_dream.id, target_dream.author_id, auth.uid())
    returning * into new_chat;

  return new_chat;
end;
$$;

create or replace function public.claim_dream_task(target_task_id uuid)
returns public.chats
language plpgsql
security definer
set search_path = public
as $$
declare
  target_task public.dream_tasks;
  target_dream public.dreams;
  existing_chat public.chats;
  new_chat public.chats;
begin
  select * into target_task
    from public.dream_tasks
    where id = target_task_id
      and status = 'OPEN'
      and completed = false
      and helper_id is null
      and author_id <> auth.uid();

  if target_task.id is null then
    raise exception 'Task is not available';
  end if;

  select * into target_dream
    from public.dreams
    where id = target_task.dream_id
      and visibility = 'public'
      and status <> 'COMPLETED';

  if target_dream.id is null then
    raise exception 'Dream is not available';
  end if;

  select * into existing_chat
    from public.chats
    where task_id = target_task.id
      and user_2 = auth.uid()
    limit 1;

  if existing_chat.id is not null then
    return existing_chat;
  end if;

  insert into public.chats (dream_id, task_id, user_1, user_2)
    values (target_dream.id, target_task.id, target_dream.author_id, auth.uid())
    returning * into new_chat;

  return new_chat;
end;
$$;

create or replace function public.select_chat_helper(target_chat_id uuid)
returns public.chats
language plpgsql
security definer
set search_path = public
as $$
declare
  target_chat public.chats;
  target_dream public.dreams;
  target_task public.dream_tasks;
begin
  select * into target_chat
    from public.chats
    where id = target_chat_id;

  if target_chat.id is null then
    raise exception 'Chat not found';
  end if;

  select * into target_dream
    from public.dreams
    where id = target_chat.dream_id
      and author_id = auth.uid()
      and status <> 'COMPLETED';

  if target_dream.id is null then
    raise exception 'Only the dream author can choose a helper';
  end if;

  if target_chat.task_id is not null then
    select * into target_task
      from public.dream_tasks
      where id = target_chat.task_id
        and dream_id = target_chat.dream_id
        and completed = false
        and status = 'OPEN'
        and helper_id is null;

    if target_task.id is null then
      raise exception 'Task already has a helper';
    end if;

    update public.dream_tasks
      set status = 'TAKEN',
          helper_id = target_chat.user_2
      where id = target_task.id;

    update public.dreams
      set status = 'TAKEN',
          helper_id = coalesce(helper_id, target_chat.user_2)
      where id = target_dream.id
        and status <> 'COMPLETED';
  else
    update public.dreams
      set status = 'TAKEN',
          helper_id = target_chat.user_2
      where id = target_dream.id
        and status = 'OPEN'
        and helper_id is null;
  end if;

  return target_chat;
end;
$$;
