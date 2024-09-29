import { relations, sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { user } from "~/server/db/schema/user";

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
  id: text("id").unique().notNull(),
  playlistId: text("playlist_id")
    .references(() => youtubePlaylist.id)
    .notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  thumbnailUrl: text("thumbnail_url").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const youtubePlaylistRelation = relations(
  youtubePlaylist,
  ({ many }) => ({
    items: many(youtubePlaylistItem),
  }),
);

export const youtubeFavoritePlaylist = sqliteTable(
  "favorite_youtube_playlist",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    playlistId: text("playlist_id").notNull(),
    name: text("name").notNull(),
    userId: text("user_id")
      .references(() => user.id)
      .notNull(),
    sort: integer("sort").notNull().default(0),
    createdAt: integer("created_at", { mode: "timestamp" }).default(
      sql`CURRENT_TIMESTAMP`,
    ),
  },
);

export const youtubeFavoritePlaylistRelation = relations(
  youtubeFavoritePlaylist,
  ({ one }) => ({
    user: one(user, {
      fields: [youtubeFavoritePlaylist.userId],
      references: [user.id],
    }),
  }),
);
