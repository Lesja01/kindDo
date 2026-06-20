alter table public.dreams
  add column if not exists display_order integer;

update public.dreams
set display_order = extract(epoch from created_at)::integer
where display_order is null;

create index if not exists dreams_author_order_idx on public.dreams(author_id, display_order desc, created_at desc);
