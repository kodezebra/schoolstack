CREATE TABLE `assets` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`key` text NOT NULL,
	`mime_type` text NOT NULL,
	`size` integer NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `assets_key_unique` ON `assets` (`key`);--> statement-breakpoint
CREATE TABLE `blocks` (
	`id` text PRIMARY KEY NOT NULL,
	`page_id` text NOT NULL,
	`type` text NOT NULL,
	`content` text NOT NULL,
	`order` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `pages` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`slug` text NOT NULL,
	`description` text,
	`meta_title` text,
	`meta_description` text,
	`parent_id` text,
	`order` integer DEFAULT 0 NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`expires_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `site_settings` (
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
	`theme` text DEFAULT 'modern' NOT NULL,
	`background_light` text DEFAULT '#f6f7f8' NOT NULL,
	`background_dark` text DEFAULT '#101922' NOT NULL,
	`font_display` text DEFAULT 'Quicksand' NOT NULL,
	`font_body` text DEFAULT 'Plus Jakarta Sans' NOT NULL,
	`border_radius` text DEFAULT 'lg' NOT NULL,
	`dark_mode` text DEFAULT 'system' NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`name` text,
	`role` text DEFAULT 'viewer' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);