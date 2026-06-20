create table if not exists public.dream_media (
  id uuid primary key default gen_random_uuid(),
  dream_id uuid not null references public.dreams(id) on delete cascade,
  url text not null,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists dream_media_dream_position_idx on public.dream_media(dream_id, position, created_at);

alter table public.dream_media enable row level security;

drop policy if exists "Visible dream media can be read" on public.dream_media;
create policy "Visible dream media can be read" on public.dream_media for select using (
  exists (
    select 1 from public.dreams
    where dreams.id = dream_media.dream_id
      and (
        dreams.visibility = 'public'
        or auth.uid() = dreams.author_id
        or auth.uid() = dreams.helper_id
      )
  )
);

drop policy if exists "Dream authors create media" on public.dream_media;
create policy "Dream authors create media" on public.dream_media for insert with check (
  exists (
    select 1 from public.dreams
    where dreams.id = dream_media.dream_id and auth.uid() = dreams.author_id
  )
);

drop policy if exists "Dream authors delete media" on public.dream_media;
create policy "Dream authors delete media" on public.dream_media for delete using (
  exists (
    select 1 from public.dreams
    where dreams.id = dream_media.dream_id and auth.uid() = dreams.author_id
  )
);

insert into public.dream_media (dream_id, url, position)
select id, video_url, 0
from public.dreams
where not exists (
  select 1 from public.dream_media where dream_media.dream_id = dreams.id
);
