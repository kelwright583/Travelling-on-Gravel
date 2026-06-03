-- Per-element text colours + overlay strength for the hero section
ALTER TABLE site_settings
  ADD COLUMN IF NOT EXISTS hero_colors jsonb DEFAULT
    '{"eyebrow":"#D75E2C","line1":"#EFEAD9","line2":"#D75E2C","subtitle":"#B9A77B","overlay":40}';
