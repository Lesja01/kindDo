alter table public.messages
  add column if not exists kind text not null default 'user',
  alter column sender_id drop not null;

alter table public.messages
  drop constraint if exists messages_kind_check;

alter table public.messages
  add constraint messages_kind_check check (kind in ('user', 'system'));

drop policy if exists "Chat participants send messages" on public.messages;

create policy "Chat participants send messages" on public.messages for insert with check (
  (
    kind = 'user'
    and auth.uid() = sender_id
    and exists (
      select 1 from public.chats
      where chats.id = messages.chat_id and auth.uid() in (chats.user_1, chats.user_2)
    )
  )
  or
  (
    kind = 'system'
    and sender_id is null
    and exists (
      select 1 from public.chats
      where chats.id = messages.chat_id and auth.uid() in (chats.user_1, chats.user_2)
    )
  )
);
