-- 001_extensions_and_helpers.sql
-- Enable required extensions and create shared helpers

create extension if not exists "citext";
create extension if not exists "pgcrypto";

-- updated_at trigger function — applied to all mutable tables
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
