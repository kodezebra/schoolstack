CREATE TABLE `student_term_remarks` (
	`id` text PRIMARY KEY NOT NULL,
	`student_id` text NOT NULL,
	`academic_year_id` text NOT NULL,
	`term_id` text,
	`remarks` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`academic_year_id`) REFERENCES `academic_years`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`term_id`) REFERENCES `terms`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
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
	`navbar_cta` text,
	`footer_config` text,
	`footer_socials` text,
	`school_name` text DEFAULT 'Your School Name' NOT NULL,
	`school_address` text DEFAULT 'Kampala, Uganda',
	`school_phone` text DEFAULT '+256 700 000 000',
	`school_email` text DEFAULT 'info@school.com',
	`theme` text DEFAULT 'modern' NOT NULL,
	`background_light` text DEFAULT '#f6f7f8' NOT NULL,
	`background_dark` text DEFAULT '#101922' NOT NULL,
	`font_display` text DEFAULT 'Quicksand' NOT NULL,
	`font_body` text DEFAULT 'Plus Jakarta Sans' NOT NULL,
	`border_radius` text DEFAULT 'lg' NOT NULL,
	`dark_mode` text DEFAULT 'system' NOT NULL,
	`updated_at` integer NOT NULL,
	`extra_fees_library` text
);
--> statement-breakpoint
INSERT INTO `__new_site_settings`("id", "logo_text", "logo_type", "logo_icon", "logo_image", "favicon", "footer_description", "primary_color", "accent_color", "navbar_config", "navbar_cta", "footer_config", "footer_socials", "school_name", "school_address", "school_phone", "school_email", "theme", "background_light", "background_dark", "font_display", "font_body", "border_radius", "dark_mode", "updated_at", "extra_fees_library") SELECT "id", "logo_text", "logo_type", "logo_icon", "logo_image", "favicon", "footer_description", "primary_color", "accent_color", "navbar_config", "navbar_cta", "footer_config", "footer_socials", "school_name", "school_address", "school_phone", "school_email", "theme", "background_light", "background_dark", "font_display", "font_body", "border_radius", "dark_mode", "updated_at", "extra_fees_library" FROM `site_settings`;--> statement-breakpoint
DROP TABLE `site_settings`;--> statement-breakpoint
ALTER TABLE `__new_site_settings` RENAME TO `site_settings`;--> statement-breakpoint
PRAGMA foreign_keys=ON;