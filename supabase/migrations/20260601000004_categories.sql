-- 004_categories.sql
-- Post categories (dispatches)

create table categories (
  id         uuid primary key default gen_random_uuid(),
  slug       text unique not null,
  name       jsonb not null,           -- {en: "...", de: "..."}
  sort_order int default 0
);

-- RLS
alter table categories enable row level security;

create policy "categories: public read"
  on categories for select
  using (true);

create policy "categories: admin write"
  on categories for all
  using (
    exists (
      select 1 from profiles
      where id = auth.uid()
        and role in ('admin', 'editor')
    )
  );

-- Seed starter categories
insert into categories (slug, name, sort_order) values
  ('field-notes',   '{"en":"Field Notes","de":"Feldberichte"}',  1),
  ('gear',          '{"en":"Gear","de":"Ausrüstung"}',           2),
  ('planning',      '{"en":"Planning","de":"Planung"}',          3),
  ('borders-visas', '{"en":"Borders & Visas","de":"Grenzen & Visa"}', 4),
  ('people',        '{"en":"People","de":"Menschen"}',           5)
on conflict (slug) do nothing;
