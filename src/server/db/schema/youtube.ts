import { relations } from "drizzle-orm";
import { pgTable, text, integer, timestamp, serial } from "drizzle-orm/pg-core";
import { user } from "~/server/db/schema/user";

export const youtubePlaylist = pgTable("youtube_playlist", {
  id: text("id").notNull().unique().primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  thumbnailUrl: text("thumbnail_url").notNull(),
  itemCount: integer("item_count").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const youtubePlaylistItem = pgTable("youtube_playlist_item", {
  id: text("playlist_id")
    .references(() => youtubePlaylist.id)
    .notNull()
    .primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  thumbnailUrl: text("thumbnail_url").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const youtubePlaylistRelation = relations(
  youtubePlaylist,
  ({ many }) => ({
    items: many(youtubePlaylistItem),
  }),
);

export const youtubeFavoritePlaylist = pgTable("favorite_youtube_playlist", {
  id: serial("id").primaryKey(),
  playlistId: text("playlist_id").notNull(),
  name: text("name").notNull(),
  userId: text("user_id").notNull(), // Assuming user table exists
  sort: integer("sort").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const youtubeFavoritePlaylistRelation = relations(
  youtubeFavoritePlaylist,
  ({ one }) => ({
    user: one(user, {
      // Assuming user table exists
      fields: [youtubeFavoritePlaylist.userId],
      references: [user.id],
    }),
  }),
);
