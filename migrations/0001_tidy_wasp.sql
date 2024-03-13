CREATE TABLE `artist` (
	`id` text NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `artistToRecords` (
	`record_slug` text NOT NULL,
	`artist_slug` text NOT NULL,
	FOREIGN KEY (`record_slug`) REFERENCES `record`(`slug`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`artist_slug`) REFERENCES `artist`(`slug`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `session` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`expires_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`username` text NOT NULL,
	`password` text NOT NULL
);
--> statement-breakpoint
ALTER TABLE record ADD `videos` text;--> statement-breakpoint
ALTER TABLE record ADD `stock` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE record ADD `condition` text;--> statement-breakpoint
ALTER TABLE record ADD `status` text DEFAULT 'active' NOT NULL;--> statement-breakpoint
ALTER TABLE record ADD `price` text NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `artist_id_unique` ON `artist` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `artist_slug_unique` ON `artist` (`slug`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_username_unique` ON `user` (`username`);