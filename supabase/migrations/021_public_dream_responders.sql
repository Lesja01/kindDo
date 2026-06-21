drop policy if exists "Public can read responders for public dreams" on public.chats;
create policy "Public can read responders for public dreams" on public.chats for select using (
  exists (
    select 1
    from public.dreams
    where dreams.id = chats.dream_id
      and dreams.visibility = 'public'
  )
);
