create table if not exists public.dream_shares (
  id uuid primary key default gen_random_uuid(),
  dream_id uuid not null references public.dreams(id) on delete cascade,
  sender_id uuid not null references public.users(id) on delete cascade,
  recipient_id uuid not null references public.users(id) on delete cascade,
  message text,
  created_at timestamptz not null default now(),
  constraint dream_shares_no_self check (sender_id <> recipient_id)
);

create index if not exists dream_shares_recipient_idx on public.dream_shares(recipient_id, created_at desc);

alter table public.dream_shares enable row level security;

drop policy if exists "Users read received dream shares" on public.dream_shares;
create policy "Users read received dream shares" on public.dream_shares for select using (auth.uid() = recipient_id or auth.uid() = sender_id);

drop policy if exists "Users share dreams" on public.dream_shares;
create policy "Users share dreams" on public.dream_shares for insert with check (
  auth.uid() = sender_id
  and sender_id <> recipient_id
  and exists (
    select 1 from public.dreams
    where dreams.id = dream_shares.dream_id
      and dreams.visibility = 'public'
  )
);
