create table if not exists public.chat_reads (
  chat_id uuid not null references public.chats(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  last_read_at timestamptz not null default now(),
  primary key (chat_id, user_id)
);

alter table public.chat_reads enable row level security;

drop policy if exists "Users read own chat reads" on public.chat_reads;
create policy "Users read own chat reads" on public.chat_reads for select using (auth.uid() = user_id);

drop policy if exists "Users upsert own chat reads" on public.chat_reads;
create policy "Users upsert own chat reads" on public.chat_reads for insert with check (
  auth.uid() = user_id
  and exists (
    select 1 from public.chats
    where chats.id = chat_reads.chat_id and auth.uid() in (chats.user_1, chats.user_2)
  )
);

drop policy if exists "Users update own chat reads" on public.chat_reads;
create policy "Users update own chat reads" on public.chat_reads for update using (auth.uid() = user_id) with check (
  auth.uid() = user_id
  and exists (
    select 1 from public.chats
    where chats.id = chat_reads.chat_id and auth.uid() in (chats.user_1, chats.user_2)
  )
);
