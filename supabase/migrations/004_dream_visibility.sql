alter table public.dreams
  add column if not exists visibility text not null default 'public';

alter table public.dreams
  drop constraint if exists dreams_visibility_check;

alter table public.dreams
  add constraint dreams_visibility_check check (visibility in ('public', 'private'));

drop policy if exists "Dreams are public" on public.dreams;

create policy "Visible dreams can be read" on public.dreams for select using (
  visibility = 'public'
  or auth.uid() = author_id
  or auth.uid() = helper_id
);

create index if not exists dreams_visibility_feed_idx on public.dreams(visibility, status, created_at desc);

create or replace function public.claim_dream(target_dream_id uuid)
returns public.chats
language plpgsql
security definer
set search_path = public
as $$
declare
  claimed_dream public.dreams;
  new_chat public.chats;
begin
  update public.dreams
    set status = 'TAKEN', helper_id = auth.uid()
    where id = target_dream_id
      and status = 'OPEN'
      and visibility = 'public'
      and helper_id is null
      and author_id <> auth.uid()
    returning * into claimed_dream;

  if claimed_dream.id is null then
    raise exception 'Dream is not available to claim';
  end if;

  insert into public.chats (dream_id, user_1, user_2)
    values (claimed_dream.id, claimed_dream.author_id, auth.uid())
    returning * into new_chat;

  return new_chat;
end;
$$;
