CREATE TABLE `category` (
	`id` text NOT NULL,
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
	`id` text NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`label_id` text,
	`year` integer,
	`cat_no` text,
	`created_at` text DEFAULT CURRENT_DATE,
	`updated_at` text DEFAULT CURRENT_DATE,
	FOREIGN KEY (`label_id`) REFERENCES `label`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `recordsToCategories` (
	`record_id` text NOT NULL,
	`category_id` text NOT NULL,
	FOREIGN KEY (`record_id`) REFERENCES `record`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`category_id`) REFERENCES `category`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `category_slug_unique` ON `category` (`slug`);--> statement-breakpoint
CREATE INDEX `categoryNameIdx` ON `category` (`name`);--> statement-breakpoint
CREATE INDEX `categorySlugIdx` ON `category` (`slug`);--> statement-breakpoint
CREATE UNIQUE INDEX `label_id_unique` ON `label` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `label_slug_unique` ON `label` (`slug`);--> statement-breakpoint
CREATE INDEX `labelNameIdx` ON `label` (`name`);--> statement-breakpoint
CREATE INDEX `labelSlugIdx` ON `label` (`slug`);--> statement-breakpoint
CREATE UNIQUE INDEX `record_id_unique` ON `record` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `record_slug_unique` ON `record` (`slug`);--> statement-breakpoint
CREATE INDEX `recordNameIdx` ON `record` (`name`);--> statement-breakpoint
CREATE INDEX `recordSlugIdx` ON `record` (`slug`);