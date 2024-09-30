PRAGMA foreign_keys=off;

--> statement-breakpoint
DROP TABLE youtube_playlist;
--> statement-breakpoint
CREATE TABLE youtube_playlist (
  id TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  thumbnail_url TEXT NOT NULL,
  item_count INTEGER NOT NULL,
  created_at INTEGER DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
  updated_at INTEGER DEFAULT (CURRENT_TIMESTAMP) NOT NULL
);
--> statement-breakpoint

PRAGMA foreign_keys=on;