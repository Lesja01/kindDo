drop policy if exists "Chat participants delete chats" on public.chats;
create policy "Chat participants delete chats" on public.chats for delete using (auth.uid() in (user_1, user_2));
