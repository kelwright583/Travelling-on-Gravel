-- Add trip metadata to adventures
ALTER TABLE adventures
  ADD COLUMN IF NOT EXISTS start_date date,
  ADD COLUMN IF NOT EXISTS end_date date,
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'planning',
  ADD COLUMN IF NOT EXISTS vehicle text,
  ADD COLUMN IF NOT EXISTS total_distance_km integer;

-- Diary entries (check-ins, fuel, breakdowns, repairs, tyres, restaurants, finds, camps, notes)
CREATE TABLE IF NOT EXISTS adventure_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  adventure_id uuid NOT NULL REFERENCES adventures(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('checkin', 'fuel', 'breakdown', 'repair', 'tyre', 'restaurant', 'find', 'camp', 'note')),
  title text,
  body text,
  lat double precision,
  lng double precision,
  location_name text,
  occurred_at timestamptz DEFAULT now(),
  images text[] DEFAULT '{}',
  tags text[] DEFAULT '{}',
  rating smallint CHECK (rating IS NULL OR (rating BETWEEN 1 AND 5)),
  data jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Planned itinerary stops
CREATE TABLE IF NOT EXISTS adventure_itinerary (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  adventure_id uuid NOT NULL REFERENCES adventures(id) ON DELETE CASCADE,
  day_number integer,
  title text NOT NULL,
  description text,
  lat double precision,
  lng double precision,
  location_name text,
  planned_date date,
  actual_entry_id uuid REFERENCES adventure_entries(id) ON DELETE SET NULL,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- RLS
ALTER TABLE adventure_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE adventure_itinerary ENABLE ROW LEVEL SECURITY;

CREATE POLICY admin_all_adventure_entries ON adventure_entries FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY public_read_adventure_entries ON adventure_entries FOR SELECT TO anon USING (true);

CREATE POLICY admin_all_adventure_itinerary ON adventure_itinerary FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY public_read_adventure_itinerary ON adventure_itinerary FOR SELECT TO anon USING (true);
