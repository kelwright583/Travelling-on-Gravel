-- seed.sql
-- Demo content mirroring the mockup — all marked published, easily deletable.
-- Run after all migrations. Uses the service role or a seeded admin user.

-- NOTE: Replace 'YOUR-ADMIN-USER-UUID' with the actual auth.users UUID
--       after creating the first admin user via Supabase Auth dashboard.

-- ============================================================
-- Categories are seeded in migration 004. Skip if already present.
-- ============================================================

-- ============================================================
-- Adventures (4 featured — matches mockup)
-- ============================================================
insert into adventures (slug, title, country, location, excerpt, tag, lat, lng, published, published_at, sort_order)
values
  (
    'kaokoland-namibia',
    '{"en":"Kaokoland","de":"Kaokoland"}',
    'Namibia',
    'Kaokoland, Namibia',
    '{"en":"The Himba heartland. No tar, no shade, no mercy. 900 km of the most punishing gravel in southern Africa.","de":"Das Herz der Himba. Kein Asphalt, kein Schatten, keine Gnade. 900 km des härtesten Schotters im südlichen Afrika."}',
    'FIELD REPORT',
    -17.5, 12.8,
    true, now(), 1
  ),
  (
    'makgadikgadi-botswana',
    '{"en":"Makgadikgadi Salt Pans","de":"Makgadikgadi-Salzpfannen"}',
    'Botswana',
    'Makgadikgadi, Botswana',
    '{"en":"Flat, white, and relentlessly brutal. The pans will eat your tyres and your pride if you let them.","de":"Flach, weiß und gnadenlos brutal. Die Pfannen fressen deine Reifen und deinen Stolz, wenn du sie lässt."}',
    'EXTREME TERRAIN',
    -20.7, 25.5,
    true, now(), 2
  ),
  (
    'sani-pass-lesotho',
    '{"en":"Sani Pass","de":"Sani Pass"}',
    'Lesotho',
    'Sani Pass, Lesotho / South Africa',
    '{"en":"The highest pub in Africa at 2874m. The road up is not for the faint-hearted or the poorly geared.","de":"Das höchste Pub Afrikas auf 2874m. Der Weg hinauf ist nichts für Schwache oder schlecht ausgerüstete Fahrzeuge."}',
    'HIGH ALTITUDE',
    -29.6, 29.3,
    true, now(), 3
  ),
  (
    'vilanculos-mozambique',
    '{"en":"Vilanculos","de":"Vilanculos"}',
    'Mozambique',
    'Vilanculos, Mozambique',
    '{"en":"Where the Mozambique Channel begins and the gravel ends. Dhow sails, cashew wine, and a well-earned rest.","de":"Wo der Mozambique-Kanal beginnt und der Schotter endet. Dhausegelboote, Cashew-Wein und eine wohlverdiente Rast."}',
    'COASTAL',
    -21.95, 35.3,
    true, now(), 4
  )
on conflict (slug) do nothing;

-- ============================================================
-- Films (3 starter films)
-- ============================================================
insert into films (title, youtube_url, youtube_id, duration, description, published, sort_order)
values
  (
    '{"en":"Kaokoland: No Road, No Rules","de":"Kaokoland: Keine Straße, keine Regeln"}',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    'dQw4w9WgXcQ',
    '14:32',
    '{"en":"900km across the remotest corner of Namibia. Three punctures, one cracked chassis, zero regrets."}',
    true, 1
  ),
  (
    '{"en":"The Pans Will Eat You Alive","de":"Die Pfannen werden dich lebendig fressen"}',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    'dQw4w9WgXcQ',
    '22:15',
    '{"en":"Makgadikgadi in the wet season. Not recommended. We did it anyway."}',
    true, 2
  ),
  (
    '{"en":"Up the Sani on a Prayer","de":"Den Sani mit einem Gebet hinauf"}',
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    'dQw4w9WgXcQ',
    '11:08',
    '{"en":"4100m altitude gain, one very nervous vehicle, and the world''s highest pub at the top."}',
    true, 3
  )
on conflict do nothing;

-- ============================================================
-- Map pins (5 starter pins)
-- ============================================================
insert into map_pins (label, note, country, lat, lng, category)
values
  ('Epupa Falls Camp',       '{"en":"Wild camp above the falls. Crocodiles below, stars above."}',                'Namibia',     -17.49, 13.26, 'camp'),
  ('Opuwo Bush Camp',        '{"en":"Roadside camp. No facilities. No complaints."}',                             'Namibia',     -17.84, 13.84, 'camp'),
  ('Chapman''s Baobab',      '{"en":"11m circumference. Possibly 4000 years old. Humbling."}',                   'Botswana',    -20.25, 25.26, 'scenic'),
  ('Sani Top Chalet',        '{"en":"Highest pub in Africa (2874m). Maluti Mountain Brew on tap. Worth every metre."}', 'Lesotho', -29.59, 29.28, 'scenic'),
  ('Vilanculos Beach Camp',  '{"en":"Journey''s end. Hammock. Cold Dois M beer. Done."}',                        'Mozambique',  -21.96, 35.31, 'camp')
on conflict do nothing;

-- ============================================================
-- Site settings stats
-- ============================================================
update site_settings
set stats = '[
  {"label":{"en":"Countries Crossed","de":"Länder überquert"},"value":14,"suffix":""},
  {"label":{"en":"km of Gravel","de":"km Schotter"},"value":47000,"suffix":"+"},
  {"label":{"en":"Punctures","de":"Reifenpannen"},"value":83,"suffix":""},
  {"label":{"en":"Litres of Diesel","de":"Liter Diesel"},"value":12400,"suffix":"+"}
]'
where id = true;
