-- 009_map_pins.sql
-- Map pins — visited places, camps, repairs, scenics

create table map_pins (
  id              uuid primary key default gen_random_uuid(),
  label           text not null,
  note            jsonb default '{}',       -- {en, de}
  country         text,
  lat             double precision not null,
  lng             double precision not null,
  category        text default 'camp'
                  check (category in ('camp', 'repair', 'scenic', 'start')),
  related_post_id uuid references posts(id),
  created_at      timestamptz default now()
);

-- RLS
alter table map_pins enable row level security;

create policy "map_pins: public read"
  on map_pins for select
  using (true);

create policy "map_pins: admin write"
  on map_pins for all
  using (
    exists (
      select 1 from profiles
      where id = auth.uid()
        and role in ('admin', 'editor')
    )
  );
