-- 005_media_assets.sql
-- Central media library (Supabase Storage references)

create table media_assets (
  id           uuid primary key default gen_random_uuid(),
  storage_path text not null,
  width        int,
  height       int,
  alt_text     jsonb default '{}',     -- {en: "...", de: "..."}
  caption      jsonb default '{}',
  tags         text[] default '{}',
  uploaded_by  uuid references profiles(id),
  created_at   timestamptz default now()
);

-- RLS
alter table media_assets enable row level security;

create policy "media_assets: public read"
  on media_assets for select
  using (true);

create policy "media_assets: admin write"
  on media_assets for all
  using (
    exists (
      select 1 from profiles
      where id = auth.uid()
        and role in ('admin', 'editor')
    )
  );
