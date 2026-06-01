-- 010_subscribers.sql
-- Newsletter subscribers with double opt-in

create table subscribers (
  id            uuid primary key default gen_random_uuid(),
  email         citext unique not null,
  locale        text default 'en',
  source        text,                  -- 'hero' | 'footer' | 'concierge'
  status        text not null default 'pending'
                check (status in ('pending', 'confirmed', 'unsubscribed')),
  confirm_token uuid default gen_random_uuid(),
  consent_at    timestamptz,
  created_at    timestamptz default now()
);

-- RLS
alter table subscribers enable row level security;

-- Anon can insert (signup form) but cannot read
create policy "subscribers: anon insert"
  on subscribers for insert
  with check (true);

-- No anon select
-- Admin full access via service role (bypasses RLS)
-- Do NOT create a user-level read policy — subscriber data is sensitive
