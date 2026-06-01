-- 006_adventures.sql
-- Adventures — featured field reports shown in the carousel

create table adventures (
  id           uuid primary key default gen_random_uuid(),
  slug         text unique not null,
  title        jsonb not null,           -- {en, de}
  country      text,
  location     text,
  excerpt      jsonb default '{}',
  body         jsonb default '{}',       -- markdown per locale: {en, de}
  cover_image  text,                     -- storage path
  gallery      text[] default '{}',
  tag          text,
  lat          double precision,
  lng          double precision,
  published    boolean default false,
  published_at timestamptz,
  sort_order   int default 0,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

create trigger adventures_updated_at
  before update on adventures
  for each row execute procedure set_updated_at();

-- RLS
alter table adventures enable row level security;

create policy "adventures: public read published"
  on adventures for select
  using (published = true);

create policy "adventures: admin read all"
  on adventures for select
  using (
    exists (
      select 1 from profiles
      where id = auth.uid()
        and role in ('admin', 'editor')
    )
  );

create policy "adventures: admin write"
  on adventures for all
  using (
    exists (
      select 1 from profiles
      where id = auth.uid()
        and role in ('admin', 'editor')
    )
  );
