-- Add theme configuration columns to site_settings
ALTER TABLE site_settings ADD COLUMN theme TEXT NOT NULL DEFAULT 'modern';
ALTER TABLE site_settings ADD COLUMN font_display TEXT NOT NULL DEFAULT 'Quicksand';
ALTER TABLE site_settings ADD COLUMN font_body TEXT NOT NULL DEFAULT 'Plus Jakarta Sans';
ALTER TABLE site_settings ADD COLUMN border_radius TEXT NOT NULL DEFAULT 'lg';
ALTER TABLE site_settings ADD COLUMN dark_mode TEXT NOT NULL DEFAULT 'system';
