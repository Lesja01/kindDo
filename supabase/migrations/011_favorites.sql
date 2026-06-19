create table if not exists public.favorites (
  user_id uuid not null references public.users(id) on delete cascade,
  dream_id uuid not null references public.dreams(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, dream_id)
);

create index if not exists favorites_dream_idx on public.favorites(dream_id);

alter table public.favorites enable row level security;

drop policy if exists "Users read own favorites" on public.favorites;
create policy "Users read own favorites" on public.favorites for select using (auth.uid() = user_id);

drop policy if exists "Users create own favorites" on public.favorites;
create policy "Users create own favorites" on public.favorites for insert with check (auth.uid() = user_id);

drop policy if exists "Users delete own favorites" on public.favorites;
create policy "Users delete own favorites" on public.favorites for delete using (auth.uid() = user_id);
