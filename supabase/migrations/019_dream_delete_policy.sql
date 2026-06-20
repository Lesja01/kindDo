drop policy if exists "Authors delete their dreams" on public.dreams;
create policy "Authors delete their dreams" on public.dreams for delete using (auth.uid() = author_id);
