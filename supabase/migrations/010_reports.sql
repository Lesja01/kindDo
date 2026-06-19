create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.users(id) on delete cascade,
  target_type text not null check (target_type in ('dream', 'story', 'profile')),
  target_id uuid not null,
  reason text not null,
  details text,
  status text not null default 'open' check (status in ('open', 'reviewing', 'resolved', 'dismissed')),
  created_at timestamptz not null default now(),
  unique (reporter_id, target_type, target_id)
);

create index if not exists reports_status_created_idx on public.reports(status, created_at desc);
create index if not exists reports_target_idx on public.reports(target_type, target_id);

alter table public.reports enable row level security;

drop policy if exists "Users create reports" on public.reports;
create policy "Users create reports" on public.reports for insert with check (auth.uid() = reporter_id);

drop policy if exists "Users read own reports" on public.reports;
create policy "Users read own reports" on public.reports for select using (auth.uid() = reporter_id);

drop policy if exists "Users update own reports" on public.reports;
create policy "Users update own reports" on public.reports for update using (auth.uid() = reporter_id) with check (auth.uid() = reporter_id);
