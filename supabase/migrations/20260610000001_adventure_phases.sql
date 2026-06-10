-- Adventure phases expansion
-- Extends adventures with 6-stage lifecycle, prep tracking, budget, and multi-country support

ALTER TABLE adventures
  ADD COLUMN IF NOT EXISTS actual_departure  timestamptz,
  ADD COLUMN IF NOT EXISTS actual_return     timestamptz,
  ADD COLUMN IF NOT EXISTS countries         text[]  DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS prep_items        jsonb   DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS budget_zar        integer,
  ADD COLUMN IF NOT EXISTS budget_notes      text;

-- Migrate existing status values to new vocabulary
-- planning → planning (unchanged)
-- active   → live
-- completed → archived
UPDATE adventures SET status = 'live'     WHERE status = 'active';
UPDATE adventures SET status = 'archived' WHERE status = 'completed';

-- Valid status values: dreaming | planning | confirmed | live | reviewing | archived
-- No CHECK constraint intentionally — keeps migrations additive and avoids lock contention.
