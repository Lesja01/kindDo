create table if not exists public.chat_hidden_users (
  chat_id uuid not null references public.chats(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  hidden_at timestamptz not null default now(),
  primary key (chat_id, user_id)
);

alter table public.chat_hidden_users enable row level security;

drop policy if exists "Users read own hidden chats" on public.chat_hidden_users;
create policy "Users read own hidden chats" on public.chat_hidden_users for select using (auth.uid() = user_id);

drop policy if exists "Users hide own chats" on public.chat_hidden_users;
create policy "Users hide own chats" on public.chat_hidden_users for insert with check (
  auth.uid() = user_id
  and exists (
    select 1 from public.chats
    where chats.id = chat_hidden_users.chat_id
      and auth.uid() in (chats.user_1, chats.user_2)
  )
);

drop policy if exists "Users update own hidden chats" on public.chat_hidden_users;
create policy "Users update own hidden chats" on public.chat_hidden_users for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

alter table public.messages
  add column if not exists edited_at timestamptz;

drop policy if exists "Message senders update own messages" on public.messages;
create policy "Message senders update own messages" on public.messages for update using (
  auth.uid() = sender_id
  and kind = 'user'
) with check (
  auth.uid() = sender_id
  and kind = 'user'
);
