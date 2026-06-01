-- Phase 6: Storage bucket for media uploads
-- Creates the 'media' bucket and RLS policies

-- Create public media bucket (5 MB size limit, images only)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'media',
  'media',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: public read
DROP POLICY IF EXISTS "Public read media" ON storage.objects;
CREATE POLICY "Public read media" ON storage.objects
  FOR SELECT USING (bucket_id = 'media');

-- Storage RLS: authenticated upload
DROP POLICY IF EXISTS "Auth upload media" ON storage.objects;
CREATE POLICY "Auth upload media" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'media');

-- Storage RLS: authenticated update (for replacement/overwrite)
DROP POLICY IF EXISTS "Auth update media" ON storage.objects;
CREATE POLICY "Auth update media" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'media')
  WITH CHECK (bucket_id = 'media');

-- Storage RLS: authenticated delete
DROP POLICY IF EXISTS "Auth delete media" ON storage.objects;
CREATE POLICY "Auth delete media" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'media');
