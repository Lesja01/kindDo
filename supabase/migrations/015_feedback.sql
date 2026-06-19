create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  message text not null,
  contact text,
  created_at timestamptz not null default now()
);

create index if not exists feedback_created_idx on public.feedback(created_at desc);
create index if not exists feedback_user_idx on public.feedback(user_id);

alter table public.feedback enable row level security;

drop policy if exists "Users create feedback" on public.feedback;
create policy "Users create feedback" on public.feedback for insert with check (auth.uid() = user_id);

drop policy if exists "Users read own feedback" on public.feedback;
create policy "Users read own feedback" on public.feedback for select using (auth.uid() = user_id);
