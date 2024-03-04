import { createId } from "@paralleldrive/cuid2";
import { index, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { record } from "./record";

export const category = sqliteTable(
  "category",
  {
    id: text("id")
      .notNull()
      .$defaultFn(() => createId()),
    slug: text("slug").unique().notNull(),
    name: text("name").notNull(),
  },
  (table) => ({
    nameIdx: index("categoryNameIdx").on(table.name),
    slugIdx: index("categorySlugIdx").on(table.slug),
  }),
);

export const recordsToCategories = sqliteTable("recordsToCategories", {
  recordId: text("record_id")
    .notNull()
    .references(() => record.id),
  categoryId: text("category_id")
    .notNull()
    .references(() => category.id),
});
