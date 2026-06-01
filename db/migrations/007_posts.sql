-- 007_posts.sql
-- Posts (dispatches / blog)

create table posts (
  id           uuid primary key default gen_random_uuid(),
  slug         text unique not null,
  title        jsonb not null,           -- {en, de}
  category_id  uuid references categories(id),
  excerpt      jsonb default '{}',
  body         jsonb default '{}',       -- markdown per locale: {en, de}
  cover_image  text,                     -- storage path
  author_id    uuid references profiles(id),
  published    boolean default false,
  published_at timestamptz,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

create trigger posts_updated_at
  before update on posts
  for each row execute procedure set_updated_at();

-- RLS
alter table posts enable row level security;

create policy "posts: public read published"
  on posts for select
  using (published = true);

create policy "posts: admin read all"
  on posts for select
  using (
    exists (
      select 1 from profiles
      where id = auth.uid()
        and role in ('admin', 'editor')
    )
  );

create policy "posts: admin write"
  on posts for all
  using (
    exists (
      select 1 from profiles
      where id = auth.uid()
        and role in ('admin', 'editor')
    )
  );
