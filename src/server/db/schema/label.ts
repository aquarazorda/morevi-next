import { index, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const label = sqliteTable(
  "label",
  {
    id: text("id").unique(),
    name: text("name").notNull(),
    slug: text("slug").unique().notNull(),
  },
  (table) => ({
    nameIdx: index("labelNameIdx").on(table.name),
    slugIdx: index("labelSlugIdx").on(table.slug),
  }),
);
