-- 002_profiles.sql
-- Admin / editor user profiles (1:1 with auth.users)

create table profiles (
  id         uuid primary key references auth.users on delete cascade,
  name       text,
  role       text not null default 'editor' check (role in ('admin', 'editor')),
  created_at timestamptz default now()
);

-- RLS
alter table profiles enable row level security;

-- Users can read and update their own profile
create policy "profiles: own row select"
  on profiles for select
  using (auth.uid() = id);

create policy "profiles: own row update"
  on profiles for update
  using (auth.uid() = id);

-- Service role has full access (handled by Supabase service_role bypass)
-- Role escalation requires service role only (no user-level policy)

-- Auto-create profile on new auth user
create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, name, role)
  values (new.id, new.raw_user_meta_data ->> 'name', coalesce(new.raw_user_meta_data ->> 'role', 'editor'));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();
