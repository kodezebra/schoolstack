PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_site_settings` (
	`id` text PRIMARY KEY NOT NULL,
	`logo_text` text DEFAULT 'KZ Cloud' NOT NULL,
	`logo_type` text DEFAULT 'icon' NOT NULL,
	`logo_icon` text DEFAULT 'zap' NOT NULL,
	`logo_image` text,
	`favicon` text,
	`footer_description` text,
	`primary_color` text DEFAULT '#6366f1' NOT NULL,
	`accent_color` text DEFAULT '#ff6b35' NOT NULL,
	`navbar_config` text,
	`footer_config` text,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_site_settings`("id", "logo_text", "logo_type", "logo_icon", "logo_image", "favicon", "footer_description", "primary_color", "accent_color", "navbar_config", "footer_config", "updated_at") SELECT "id", "logo_text", "logo_type", "logo_icon", "logo_image", "favicon", "footer_description", "primary_color", "accent_color", "navbar_config", "footer_config", "updated_at" FROM `site_settings`;--> statement-breakpoint
DROP TABLE `site_settings`;--> statement-breakpoint
ALTER TABLE `__new_site_settings` RENAME TO `site_settings`;--> statement-breakpoint
PRAGMA foreign_keys=ON;