-- बहल झलक — Direct Video Upload Storage
-- Supabase SQL Editor में एक बार चलाएँ।

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'news-videos',
  'news-videos',
  true,
  52428800,
  array['video/mp4','video/webm','video/quicktime']
)
on conflict (id) do update
set public = true,
    file_size_limit = 52428800,
    allowed_mime_types = array['video/mp4','video/webm','video/quicktime'];

drop policy if exists "news_videos_admin_insert" on storage.objects;
drop policy if exists "news_videos_public_read" on storage.objects;

create policy "news_videos_admin_insert"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'news-videos'
  and auth.jwt() ->> 'email' = 'surenderbugaliya067@gmail.com'
);

create policy "news_videos_public_read"
on storage.objects
for select
to public
using (bucket_id = 'news-videos');
