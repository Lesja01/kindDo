create table if not exists public.story_mentions (
  id uuid primary key default gen_random_uuid(),
  story_id uuid not null references public.stories(id) on delete cascade,
  user_id uuid references public.users(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

create index if not exists story_mentions_user_idx on public.story_mentions(user_id, created_at desc);
create index if not exists story_mentions_story_idx on public.story_mentions(story_id);

alter table public.story_mentions enable row level security;

drop policy if exists "Story mentions are readable" on public.story_mentions;
create policy "Story mentions are readable" on public.story_mentions for select using (true);

drop policy if exists "Story authors create mentions" on public.story_mentions;
create policy "Story authors create mentions" on public.story_mentions for insert with check (
  exists (
    select 1 from public.stories
    where stories.id = story_mentions.story_id
      and stories.author_id = auth.uid()
  )
);
