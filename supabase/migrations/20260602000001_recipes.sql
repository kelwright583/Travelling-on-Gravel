-- recipes: structured outdoor-cooking content for the "Cast Iron" section
create table recipes (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,
  title         jsonb not null,
  subtitle      jsonb default '{}',
  intro         jsonb default '{}',
  cover_image   text,
  gallery       text[] default '{}',

  -- timing (minutes)
  prep_minutes  int,
  cook_minutes  int,
  total_minutes int generated always as (coalesce(prep_minutes,0) + coalesce(cook_minutes,0)) stored,
  servings      int,

  difficulty    text default 'medium' check (difficulty in ('easy','medium','hard')),
  cook_method   text default 'fire' check (cook_method in ('fire','coals','potjie','braai-grid','skottel','gas','dutch-oven','other')),

  -- structured content as jsonb arrays
  ingredients   jsonb not null default '[]',
  steps         jsonb not null default '[]',
  tips          jsonb default '[]',
  equipment     jsonb default '[]',

  tags          text[] default '{}',

  -- AI vetting state (advisory, never blocks publish)
  ai_reviewed   boolean default false,
  ai_notes      jsonb default '{}',

  author_id     uuid references profiles(id),
  published     boolean default false,
  published_at  timestamptz,
  sort_order    int default 0,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

create trigger recipes_updated_at
  before update on recipes
  for each row execute procedure set_updated_at();

alter table recipes enable row level security;

create policy "recipes: public read published"
  on recipes for select using (published = true);

create policy "recipes: admin read all"
  on recipes for select using (
    exists (select 1 from profiles where id = auth.uid() and role in ('admin','editor'))
  );

create policy "recipes: admin write"
  on recipes for all using (
    exists (select 1 from profiles where id = auth.uid() and role in ('admin','editor'))
  );

-- Cast Iron category
insert into categories (slug, name, sort_order) values
  ('cast-iron', '{"en":"Cast Iron","de":"Gusseisen"}', 6)
on conflict (slug) do nothing;
