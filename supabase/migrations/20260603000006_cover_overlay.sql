-- Cover overlay toggle: lets admin choose duotone on card thumbnails per item
-- Default true for tables that currently always show duotone; false for recipes (no duotone today)
ALTER TABLE posts      ADD COLUMN IF NOT EXISTS cover_overlay boolean NOT NULL DEFAULT true;
ALTER TABLE recipes    ADD COLUMN IF NOT EXISTS cover_overlay boolean NOT NULL DEFAULT false;
ALTER TABLE adventures ADD COLUMN IF NOT EXISTS cover_overlay boolean NOT NULL DEFAULT true;
ALTER TABLE films      ADD COLUMN IF NOT EXISTS cover_overlay boolean NOT NULL DEFAULT true;
