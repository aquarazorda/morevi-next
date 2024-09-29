PRAGMA foreign_keys=off;

--> statement-breakpoint 
CREATE TABLE `favorite_youtube_playlist2` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`playlist_id` text NOT NULL,
	`user_id` text NOT NULL,
	`sort` integer DEFAULT 0 NOT NULL,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint 
DROP TABLE `favorite_youtube_playlist`;--> statement-breakpoint 
ALTER TABLE `favorite_youtube_playlist2` RENAME TO `favorite_youtube_playlist`;--> statement-breakpoint 

PRAGMA foreign_keys=on;