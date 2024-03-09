import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { record } from "./record";

export const artist = sqliteTable("artist", {
  id: text("id").unique().notNull(),
  name: text("name").notNull(),
  slug: text("slug").unique().notNull(),
});

export const artistToRecordRelation = sqliteTable("artistToRecords", {
  recordSlug: text("record_slug")
    .notNull()
    .references(() => record.slug),
  artistSlug: text("artist_slug")
    .notNull()
    .references(() => artist.slug),
});
