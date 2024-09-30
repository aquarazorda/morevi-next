import { pgTable, text, index } from "drizzle-orm/pg-core";

export const label = pgTable(
  "label",
  {
    id: text("id").unique(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
  },
  (table) => ({
    nameIdx: index("label_name_idx").on(table.name),
    slugIdx: index("label_slug_idx").on(table.slug),
  }),
);
