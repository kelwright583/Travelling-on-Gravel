-- 003_site_settings.sql
-- Single-row site configuration: hero, theme, fonts, socials, stats

create table site_settings (
  id             boolean primary key default true check (id),
  hero_line1     jsonb not null default '{"en":"LESS GLAMPING."}',
  hero_line2     jsonb not null default '{"en":"MORE GRAVEL."}',
  hero_subtitle  jsonb not null default '{"en":"Honest dispatches from the tracks less taken across Africa."}',
  hero_location  text default 'KAOKOLAND, NAMIBIA',
  hero_coords    text default '',
  hero_image     text,                              -- storage path
  theme          jsonb not null default '{}',       -- {accent, olive, khaki, ink, bone, ...}
  fonts          jsonb not null default '{"display":"Montserrat","body":"Inter"}',
  socials        jsonb not null default '{}',       -- {youtube, instagram, tiktok}
  stats          jsonb not null default '[]',       -- [{label:{en,de}, value:number, suffix?}]
  updated_at     timestamptz default now()
);

-- Seed the single row
insert into site_settings (id) values (true) on conflict do nothing;

-- updated_at trigger
create trigger site_settings_updated_at
  before update on site_settings
  for each row execute procedure set_updated_at();

-- RLS
alter table site_settings enable row level security;

-- Anyone can read site settings (theme, hero etc. needed for public pages)
create policy "site_settings: public read"
  on site_settings for select
  using (true);

-- Only authenticated admin/editors can update
create policy "site_settings: admin update"
  on site_settings for update
  using (
    exists (
      select 1 from profiles
      where id = auth.uid()
        and role in ('admin', 'editor')
    )
  );
