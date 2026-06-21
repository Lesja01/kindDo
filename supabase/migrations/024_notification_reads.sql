create table if not exists public.notification_reads (
  user_id uuid primary key references public.users(id) on delete cascade,
  last_read_at timestamptz not null default now()
);

alter table public.notification_reads enable row level security;

drop policy if exists "Users read own notification state" on public.notification_reads;
create policy "Users read own notification state" on public.notification_reads for select using (auth.uid() = user_id);

drop policy if exists "Users insert own notification state" on public.notification_reads;
create policy "Users insert own notification state" on public.notification_reads for insert with check (auth.uid() = user_id);

drop policy if exists "Users update own notification state" on public.notification_reads;
create policy "Users update own notification state" on public.notification_reads for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
