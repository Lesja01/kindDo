alter table public.messages
  add column if not exists attachment_type text check (attachment_type in ('image', 'contact', 'location')),
  add column if not exists attachment_url text,
  add column if not exists attachment_payload jsonb;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('chat-attachments', 'chat-attachments', true, 10485760, array['image/png', 'image/jpeg', 'image/webp'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public chat attachment reads" on storage.objects;
create policy "Public chat attachment reads" on storage.objects for select using (bucket_id = 'chat-attachments');

drop policy if exists "Users upload chat attachments" on storage.objects;
create policy "Users upload chat attachments" on storage.objects for insert with check (bucket_id = 'chat-attachments' and auth.role() = 'authenticated');
