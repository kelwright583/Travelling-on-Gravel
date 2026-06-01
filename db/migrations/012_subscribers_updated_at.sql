-- 012_subscribers_updated_at.sql
-- Add updated_at column + trigger to subscribers table

alter table subscribers
  add column if not exists updated_at timestamptz default now();

create trigger subscribers_updated_at
  before update on subscribers
  for each row execute function set_updated_at();
