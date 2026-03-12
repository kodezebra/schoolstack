CREATE TABLE `site_settings` (
	`id` text PRIMARY KEY NOT NULL,
	`logo_text` text DEFAULT 'KZ Cloud' NOT NULL,
	`logo_icon` text DEFAULT 'layout' NOT NULL,
	`footer_description` text,
	`primary_color` text DEFAULT '#6366f1' NOT NULL,
	`accent_color` text DEFAULT '#ff6b35' NOT NULL,
	`updated_at` integer NOT NULL
);
