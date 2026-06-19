create table if not exists public.profile_photos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  url text not null,
  created_at timestamptz not null default now()
);

create index if not exists profile_photos_user_created_idx on public.profile_photos(user_id, created_at desc);

alter table public.profile_photos enable row level security;

drop policy if exists "Public profile photos are readable" on public.profile_photos;
create policy "Public profile photos are readable" on public.profile_photos for select using (true);

drop policy if exists "Users create own profile photos" on public.profile_photos;
create policy "Users create own profile photos" on public.profile_photos for insert with check (auth.uid() = user_id);

drop policy if exists "Users delete own profile photos" on public.profile_photos;
create policy "Users delete own profile photos" on public.profile_photos for delete using (auth.uid() = user_id);
