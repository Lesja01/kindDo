alter table public.users
  add column if not exists age integer,
  add column if not exists location text;

alter table public.users
  drop constraint if exists users_age_check;

alter table public.users
  add constraint users_age_check check (age is null or (age >= 13 and age <= 120));

create index if not exists users_location_idx on public.users(location);
