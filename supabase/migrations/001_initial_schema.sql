create extension if not exists "pgcrypto";

create type dream_status as enum ('OPEN', 'TAKEN', 'COMPLETED');
create type social_platform as enum ('instagram', 'tiktok', 'telegram');

create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default 'Dreamer',
  avatar text,
  bio text,
  age integer check (age is null or (age >= 13 and age <= 120)),
  location text,
  reputation_score integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.dreams (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.users(id) on delete cascade,
  title text not null,
  description text not null,
  video_url text not null,
  category text not null,
  visibility text not null default 'public' check (visibility in ('public', 'private')),
  status dream_status not null default 'OPEN',
  helper_id uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint dream_helper_not_author check (helper_id is null or helper_id <> author_id)
);

create table public.chats (
  id uuid primary key default gen_random_uuid(),
  dream_id uuid not null unique references public.dreams(id) on delete cascade,
  user_1 uuid not null references public.users(id) on delete cascade,
  user_2 uuid not null references public.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint chats_two_users check (user_1 <> user_2)
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  chat_id uuid not null references public.chats(id) on delete cascade,
  sender_id uuid references public.users(id) on delete cascade,
  text text not null,
  kind text not null default 'user' check (kind in ('user', 'system')),
  created_at timestamptz not null default now()
);

create table public.chat_reads (
  chat_id uuid not null references public.chats(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  last_read_at timestamptz not null default now(),
  primary key (chat_id, user_id)
);

create table public.stories (
  id uuid primary key default gen_random_uuid(),
  dream_id uuid not null unique references public.dreams(id) on delete cascade,
  author_id uuid not null references public.users(id) on delete cascade,
  helper_id uuid not null references public.users(id) on delete cascade,
  video_url text not null,
  text text,
  created_at timestamptz not null default now()
);

create table public.social_links (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  platform social_platform not null,
  url text not null,
  unique (user_id, platform)
);

create index dreams_feed_idx on public.dreams(status, created_at desc);
create index dreams_visibility_feed_idx on public.dreams(visibility, status, created_at desc);
create index dreams_author_idx on public.dreams(author_id);
create index dreams_helper_idx on public.dreams(helper_id);
create index messages_chat_created_idx on public.messages(chat_id, created_at);
create index stories_created_idx on public.stories(created_at desc);
create index social_links_user_idx on public.social_links(user_id);

alter table public.users enable row level security;
alter table public.dreams enable row level security;
alter table public.chats enable row level security;
alter table public.messages enable row level security;
alter table public.chat_reads enable row level security;
alter table public.stories enable row level security;
alter table public.social_links enable row level security;

create policy "Users are public" on public.users for select using (true);
create policy "Users update own profile" on public.users for update using (auth.uid() = id);

create policy "Visible dreams can be read" on public.dreams for select using (
  visibility = 'public'
  or auth.uid() = author_id
  or auth.uid() = helper_id
);
create policy "Authenticated users create dreams" on public.dreams for insert with check (auth.uid() = author_id);
create policy "Authors update their dreams" on public.dreams for update using (auth.uid() = author_id);

create policy "Chat participants read chats" on public.chats for select using (auth.uid() in (user_1, user_2));
create policy "Chat participants read messages" on public.messages for select using (
  exists (
    select 1 from public.chats
    where chats.id = messages.chat_id and auth.uid() in (chats.user_1, chats.user_2)
  )
);
create policy "Chat participants send messages" on public.messages for insert with check (
  (
    kind = 'user'
    and auth.uid() = sender_id
    and exists (
      select 1 from public.chats
      where chats.id = messages.chat_id and auth.uid() in (chats.user_1, chats.user_2)
    )
  )
  or
  (
    kind = 'system'
    and sender_id is null
    and exists (
      select 1 from public.chats
      where chats.id = messages.chat_id and auth.uid() in (chats.user_1, chats.user_2)
    )
  )
);

create policy "Users read own chat reads" on public.chat_reads for select using (auth.uid() = user_id);
create policy "Users upsert own chat reads" on public.chat_reads for insert with check (
  auth.uid() = user_id
  and exists (
    select 1 from public.chats
    where chats.id = chat_reads.chat_id and auth.uid() in (chats.user_1, chats.user_2)
  )
);
create policy "Users update own chat reads" on public.chat_reads for update using (auth.uid() = user_id) with check (
  auth.uid() = user_id
  and exists (
    select 1 from public.chats
    where chats.id = chat_reads.chat_id and auth.uid() in (chats.user_1, chats.user_2)
  )
);

create policy "Stories are public" on public.stories for select using (true);
create policy "Authors create gratitude stories" on public.stories for insert with check (auth.uid() = author_id);

create policy "Social links are public" on public.social_links for select using (true);
create policy "Users manage own links" on public.social_links for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, name, avatar)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'full_name', 'Dreamer'),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.claim_dream(target_dream_id uuid)
returns public.chats
language plpgsql
security definer
set search_path = public
as $$
declare
  claimed_dream public.dreams;
  new_chat public.chats;
begin
  update public.dreams
    set status = 'TAKEN', helper_id = auth.uid()
    where id = target_dream_id
      and status = 'OPEN'
      and visibility = 'public'
      and helper_id is null
      and author_id <> auth.uid()
    returning * into claimed_dream;

  if claimed_dream.id is null then
    raise exception 'Dream is not available to claim';
  end if;

  insert into public.chats (dream_id, user_1, user_2)
    values (claimed_dream.id, claimed_dream.author_id, auth.uid())
    returning * into new_chat;

  return new_chat;
end;
$$;

create or replace function public.complete_dream_with_story(
  target_dream_id uuid,
  gratitude_video_url text,
  gratitude_text text
)
returns public.stories
language plpgsql
security definer
set search_path = public
as $$
declare
  completed_dream public.dreams;
  new_story public.stories;
begin
  update public.dreams
    set status = 'COMPLETED'
    where id = target_dream_id
      and author_id = auth.uid()
      and status = 'TAKEN'
      and helper_id is not null
    returning * into completed_dream;

  if completed_dream.id is null then
    raise exception 'Dream cannot be completed';
  end if;

  insert into public.stories (dream_id, author_id, helper_id, video_url, text)
    values (
      completed_dream.id,
      completed_dream.author_id,
      completed_dream.helper_id,
      gratitude_video_url,
      gratitude_text
    )
    returning * into new_story;

  update public.users set reputation_score = reputation_score + 1
    where id in (completed_dream.author_id, completed_dream.helper_id);

  return new_story;
end;
$$;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('dream-videos', 'dream-videos', true, 52428800, array['video/mp4', 'video/webm', 'video/quicktime']),
  ('story-videos', 'story-videos', true, 52428800, array['video/mp4', 'video/webm', 'video/quicktime']),
  ('avatars', 'avatars', true, 5242880, array['image/png', 'image/jpeg', 'image/webp'])
on conflict (id) do nothing;

create policy "Public video reads" on storage.objects for select using (
  bucket_id in ('dream-videos', 'story-videos', 'avatars')
);

create policy "Users upload dream videos" on storage.objects for insert with check (
  bucket_id in ('dream-videos', 'story-videos', 'avatars') and auth.role() = 'authenticated'
);
