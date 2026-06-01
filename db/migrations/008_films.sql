-- 008_films.sql
-- Films (YouTube videos)

create table films (
  id          uuid primary key default gen_random_uuid(),
  title       jsonb not null,            -- {en, de}
  youtube_url text not null,
  youtube_id  text not null,
  duration    text,
  thumbnail   text,                      -- derived or custom storage path
  description jsonb default '{}',
  published   boolean default true,
  sort_order  int default 0,
  created_at  timestamptz default now()
);

-- RLS
alter table films enable row level security;

create policy "films: public read published"
  on films for select
  using (published = true);

create policy "films: admin read all"
  on films for select
  using (
    exists (
      select 1 from profiles
      where id = auth.uid()
        and role in ('admin', 'editor')
    )
  );

create policy "films: admin write"
  on films for all
  using (
    exists (
      select 1 from profiles
      where id = auth.uid()
        and role in ('admin', 'editor')
    )
  );
