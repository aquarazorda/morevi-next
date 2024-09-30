import { pgTable, text, uniqueIndex } from "drizzle-orm/pg-core";
import { record } from "./record";

export const artist = pgTable(
  "artist",
  {
    id: text("id").notNull().unique(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
  },
  (table) => ({
    slugIdx: uniqueIndex("artist_slug_idx").on(table.slug),
  }),
);

export const artistToRecordRelation = pgTable("artist_to_records", {
  recordSlug: text("record_slug")
    .notNull()
    .references(() => record.slug),
  artistSlug: text("artist_slug")
    .notNull()
    .references(() => artist.slug),
});
