import { relations, sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const youtubePlaylist = sqliteTable("youtube_playlist", {
  id: text("id").unique(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  thumbnailUrl: text("thumbnail_url").notNull(),
  itemCount: integer("item_count").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).default(
    sql`CURRENT_TIMESTAMP`,
  ),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(
    sql`CURRENT_TIMESTAMP`,
  ),
});

export const youtubePlaylistItem = sqliteTable("youtube_playlist_item", {
  id: text("id").unique(),
  playlistId: text("playlist_id").references(() => youtubePlaylist.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  thumbnailUrl: text("thumbnail_url").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).default(
    sql`CURRENT_TIMESTAMP`,
  ),
});

export const youtubePlaylistRelation = relations(
  youtubePlaylist,
  ({ many }) => ({
    items: many(youtubePlaylistItem),
  }),
);