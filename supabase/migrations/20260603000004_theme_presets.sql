-- Saved theme presets — array of { id, name, overrides } objects
ALTER TABLE site_settings
  ADD COLUMN IF NOT EXISTS theme_presets jsonb DEFAULT '[]';
