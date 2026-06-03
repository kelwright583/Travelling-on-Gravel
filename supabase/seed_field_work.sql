-- Seed: three real Field Work posts
-- These are the owner's genuine first pieces, not demo data.
-- Run once against production after the recipes migration is applied.
-- Editable and deletable from /admin/field-work like any other post.
-- TODO: German translations — leave de empty; public page falls back to EN via t() helper.

insert into posts (slug, title, category_id, excerpt, body, cover_image, author_id, published, published_at)
values (
  'whos-driving-this-thing',
  '{"en":"Who''s Driving This Thing?","de":""}',
  (select id from categories where slug = 'field-notes'),
  '{"en":"A Zululand boy with a German accent, an insurance licence, and a deeply unreasonable need to drive where the tar runs out.","de":""}',
  '{"en":"# Who''s Driving This Thing?\n\nRight. Before you trust a word on this site, you probably want to know whose hands are on the wheel.\n\nMy name is Rupert Niebuhr. I grew up in Zululand — proper Zululand, not the postcard version — the son of a German father who treated Africa like a continent-sized workshop and a South African mother who thought road trips were a perfectly normal way to spend a school holiday. She was right. He was also right. Between them, they ruined me for ordinary holidays permanently.\n\nI hold an insurance licence, which means I spend a reasonable portion of my working life thinking about risk in formal, actuarial terms. Then I get in the truck and do the opposite. There is probably a lesson in there somewhere. I haven''t found it yet.\n\n## Why Overland?\n\nBecause the tar runs out and something very interesting usually starts. Because the satellite image on the app shows a track and when you get there it''s more of a suggestion. Because Africa has a way of making you feel very small and very alive at the same time, and that combination is genuinely hard to find elsewhere.\n\nI''m not a professional adventurer. I''m not building a brand. This is not content — or at least, it wasn''t supposed to be. It started as notes I kept for myself after trips, partly to remember where the good campsites were and partly to process what happened when things went sideways. A few people read them and said they were useful. So here we are.\n\n## What You''ll Find Here\n\nHonest field notes. The roads that worked and the ones that didn''t. What the gravel sounds like at different speeds. What breaks on a truck and how you fix it in the dark 200km from the nearest town. What it''s like to cook a potjie on a fire you built yourself in a place where nobody knows where you are.\n\nAlso recipes, because a man has to eat, and eating well in the bush is a skill that deserves more respect than it gets.\n\nNo sponsored content. No affiliate links. No listicle of ''10 Things You Need For Your Next Adventure.'' If I bought something and it was useful I might mention it. If it wasn''t, I''ll say that too.\n\nThat''s the deal. Let''s go.","de":""}',
  null,
  (select id from profiles where role = 'admin' limit 1),
  true,
  now() - interval '14 days'
)
on conflict (slug) do nothing;

insert into posts (slug, title, category_id, excerpt, body, cover_image, author_id, published, published_at)
values (
  'lesotho-will-humble-you',
  '{"en":"Lesotho Will Humble You, and Your Brakes","de":""}',
  (select id from categories where slug = 'field-notes'),
  '{"en":"The roads wind on forever and the sunsets are obscene. Nobody warns you the kingdom in the sky has opinions about your brake pads.","de":""}',
  '{"en":"# Lesotho Will Humble You, and Your Brakes\n\nThere is a moment, somewhere above 3,000 metres on Sani Pass, when you look down at the road you just drove and understand that your truck has strong opinions about its own survival that do not always align with yours.\n\nI was on the way to Lesotho in late May. Everyone who has been will tell you: go in autumn. The summer rains turn the passes into something that isn''t quite a road and isn''t quite a river, and the sensible thing is to wait them out. I went in May. The sensible window. The brakes were fine when I left Durban.\n\n## The Pass\n\nSani is not the most technical pass in southern Africa. There are harder ones. But Sani has a particular quality — the altitude comes at you fast, the corners are tight, and the surface is honest about its opinions. It is loose, rocky in sections, and the inside edge drops into nothing in a way that focuses the mind.\n\nThe uphill was fine. The problem is always the downhill.\n\nBy the time I got to the top I could smell the brakes. Not a catastrophic smell, more of a polite warning. The kind of smell that means the pads are working, they''re just working very hard and would appreciate acknowledgement.\n\n## The Kingdom\n\nLesotho is one of the stranger places I''ve been, which is saying something. It is a landlocked country entirely surrounded by South Africa, it sits mostly above 1,800 metres, and its people have a calm, unhurried relationship with time and with outsiders that takes some adjusting to if you''re used to the South African pace.\n\nThe roads inside the country range from reasonable to aspirational. The signage is optimistic. The scenery is, without exaggeration, some of the most arresting in Africa — wide, clean light, no fences, mountains that go on until they don''t, and sunsets that look like someone turned up the saturation.\n\nI spent four days there. Drove the Roof of Africa route in reverse, which meant I got the dramatic descents rather than the climbs. By day three the brake smell had faded. By day four I was driving on feel and prayer in roughly equal measure.\n\n## The Lesson\n\nGet your brakes done before you go. Check the fluid. Carry extra. If someone who has been there tells you this, they are not being dramatic — they are being accurate.\n\nAlso bring a good jacket. And coffee. Lesotho is cold in the mornings and the coffee situation is not what it could be.\n\nI''ll go back. With better brakes. And better coffee.","de":""}',
  null,
  (select id from profiles where role = 'admin' limit 1),
  true,
  now() - interval '7 days'
)
on conflict (slug) do nothing;

insert into posts (slug, title, category_id, excerpt, body, cover_image, author_id, published, published_at)
values (
  'mozambique-tide-time',
  '{"en":"Mozambique Runs on Tide Time, Not Yours","de":""}',
  (select id from categories where slug = 'field-notes'),
  '{"en":"An insurance broker with a German need for schedules, marooned by the tide near Maputo. The tide won. It always does.","de":""}',
  '{"en":"# Mozambique Runs on Tide Time, Not Yours\n\nI have a German father. This means I have a German relationship with time, which is to say: specific, non-negotiable, and regularly humiliated by Africa.\n\nMozambique does not care about your schedule. Mozambique runs on tide time, fish time, the time the ferry feels like leaving, and the time the road becomes passable again after the rain. None of these times are your time. The sooner you accept this, the better your trip will go.\n\nI learned this near Maputo, on a beach road that was very much a beach road in the literal sense — it went along the beach, and the beach had tidal opinions about who could use it and when.\n\n## The Setup\n\nThe route was simple on paper. Down the coast, through a small town, camp at a spot a local had described to me with great specificity and zero mention of tidal considerations. The spot was beautiful. I got there in the early afternoon, had time to set up, swim, start a fire, cook rice and beans with a tin of pilchards I''d been carrying since Nelspruit.\n\nThe problem was the road back.\n\n## What Happens When the Tide Comes In\n\nThe road, when the tide was out, was fine. Hard-packed sand, a bit corrugated in places, the usual. When the tide came in, the road became the sea. Not flooded — occupied. The sea simply moved in and sat on it, three hundred metres of it, water to the dunes, no negotiation available.\n\nI had two options: wait it out or try to find an alternative route on a map that was, I will be honest, not entirely trustworthy in this section.\n\nI waited.\n\n## Tide Time\n\nFour hours. I had a fire, I had food, I had no signal and therefore no anxiety about emails. There is a version of this story where it is a disaster. It is not that version. It was four hours of watching pelicans work the shallows and listening to the kind of quiet that requires genuine distance from cities to achieve.\n\nThe tide went out. The road came back. I drove home.\n\nThe lesson is not ''don''t drive coastal Mozambique.'' The lesson is: get a tide table. They are free, they are accurate, and they are the most useful document you can carry in that country. More useful than any map. More useful than most advice.\n\nAlso carry spare rice. And pilchards. They keep. They travel. They are enough.","de":""}',
  null,
  (select id from profiles where role = 'admin' limit 1),
  true,
  now() - interval '3 days'
)
on conflict (slug) do nothing;
