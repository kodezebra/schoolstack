ALTER TABLE `site_settings` ADD `footer_logo_layout` text DEFAULT 'horizontal';--> statement-breakpoint
ALTER TABLE `site_settings` ADD `footer_logo_monochrome` integer DEFAULT false;--> statement-breakpoint
ALTER TABLE `site_settings` DROP COLUMN `navbar_cta`;