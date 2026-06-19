drop policy if exists "Users create own profile" on public.users;
create policy "Users create own profile" on public.users for insert with check (auth.uid() = id);
