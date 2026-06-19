create table if not exists public.dream_tasks (
  id uuid primary key default gen_random_uuid(),
  dream_id uuid not null references public.dreams(id) on delete cascade,
  author_id uuid not null references public.users(id) on delete cascade,
  text text not null,
  completed boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists dream_tasks_dream_idx on public.dream_tasks(dream_id, created_at);

alter table public.dream_tasks enable row level security;

drop policy if exists "Dream participants read tasks" on public.dream_tasks;
create policy "Dream participants read tasks" on public.dream_tasks for select using (
  exists (
    select 1 from public.dreams
    where dreams.id = dream_tasks.dream_id
      and (auth.uid() = dreams.author_id or auth.uid() = dreams.helper_id)
  )
);

drop policy if exists "Dream authors create tasks" on public.dream_tasks;
create policy "Dream authors create tasks" on public.dream_tasks for insert with check (
  auth.uid() = author_id
  and exists (
    select 1 from public.dreams
    where dreams.id = dream_tasks.dream_id and auth.uid() = dreams.author_id
  )
);

drop policy if exists "Dream authors update tasks" on public.dream_tasks;
create policy "Dream authors update tasks" on public.dream_tasks for update using (
  exists (
    select 1 from public.dreams
    where dreams.id = dream_tasks.dream_id and auth.uid() = dreams.author_id
  )
) with check (
  exists (
    select 1 from public.dreams
    where dreams.id = dream_tasks.dream_id and auth.uid() = dreams.author_id
  )
);

drop policy if exists "Dream authors delete tasks" on public.dream_tasks;
create policy "Dream authors delete tasks" on public.dream_tasks for delete using (
  exists (
    select 1 from public.dreams
    where dreams.id = dream_tasks.dream_id and auth.uid() = dreams.author_id
  )
);
