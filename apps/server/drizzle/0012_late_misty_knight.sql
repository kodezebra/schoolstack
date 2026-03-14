DROP INDEX `pages_slug_unique`;--> statement-breakpoint
ALTER TABLE `pages` ADD `parent_id` text REFERENCES pages(id);--> statement-breakpoint
ALTER TABLE `pages` ADD `order` integer DEFAULT 0 NOT NULL;