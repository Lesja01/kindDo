update storage.buckets
set allowed_mime_types = array['image/png', 'image/jpeg', 'image/webp', 'video/mp4', 'video/webm', 'video/quicktime']
where id in ('dream-videos', 'story-videos');
