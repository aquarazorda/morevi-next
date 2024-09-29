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
CREATE TABLE `category` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `label` (
	`id` text,
	`name` text NOT NULL,
	`slug` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `record` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`label_id` text,
	`year` integer,
	`cat_no` text,
	`videos` text,
	`stock` integer DEFAULT 0 NOT NULL,
	`condition` text,
	`status` text DEFAULT 'active' NOT NULL,
	`price` text NOT NULL,
	`created_at` text DEFAULT CURRENT_DATE,
	`updated_at` text DEFAULT CURRENT_DATE,
	FOREIGN KEY (`label_id`) REFERENCES `label`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `recordsToCategories` (
	`record_id` text NOT NULL,
	`category_id` text NOT NULL,
	PRIMARY KEY(`record_id`, `category_id`),
	FOREIGN KEY (`record_id`) REFERENCES `record`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`category_id`) REFERENCES `category`(`id`) ON UPDATE no action ON DELETE no action
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
	`password` text NOT NULL,
	`is_admin` integer DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE `favorite_youtube_playlist` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`playlist_id` text,
	`user_id` text NOT NULL,
	`sort` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`playlist_id`) REFERENCES `youtube_playlist`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `youtube_playlist` (
	`id` text,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`thumbnail_url` text NOT NULL,
	`item_count` integer NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `youtube_playlist_item` (
	`id` text,
	`playlist_id` text,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`thumbnail_url` text NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`playlist_id`) REFERENCES `youtube_playlist`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `artist_id_unique` ON `artist` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `artist_slug_unique` ON `artist` (`slug`);--> statement-breakpoint
CREATE UNIQUE INDEX `category_slug_unique` ON `category` (`slug`);--> statement-breakpoint
CREATE INDEX `categoryNameIdx` ON `category` (`name`);--> statement-breakpoint
CREATE INDEX `categorySlugIdx` ON `category` (`slug`);--> statement-breakpoint
CREATE UNIQUE INDEX `label_id_unique` ON `label` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `label_slug_unique` ON `label` (`slug`);--> statement-breakpoint
CREATE INDEX `labelNameIdx` ON `label` (`name`);--> statement-breakpoint
CREATE INDEX `labelSlugIdx` ON `label` (`slug`);--> statement-breakpoint
CREATE UNIQUE INDEX `record_slug_unique` ON `record` (`slug`);--> statement-breakpoint
CREATE INDEX `recordNameIdx` ON `record` (`name`);--> statement-breakpoint
CREATE INDEX `recordSlugIdx` ON `record` (`slug`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_username_unique` ON `user` (`username`);--> statement-breakpoint
CREATE UNIQUE INDEX `youtube_playlist_id_unique` ON `youtube_playlist` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `youtube_playlist_item_id_unique` ON `youtube_playlist_item` (`id`);