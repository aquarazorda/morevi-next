import { createId } from "@paralleldrive/cuid2";
import { pgTable, text, index, primaryKey } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { record } from "./record";

export const category = pgTable(
  "category",
  {
    id: text("id")
      .notNull()
      .primaryKey()
      .$defaultFn(() => createId()),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
  },
  (table) => ({
    nameIdx: index("category_name_idx").on(table.name),
    slugIdx: index("category_slug_idx").on(table.slug),
  }),
);

export const recordsToCategories = pgTable(
  "records_to_categories",
  {
    recordId: text("record_id")
      .notNull()
      .references(() => record.id),
    categoryId: text("category_id")
      .notNull()
      .references(() => category.id),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.recordId, table.categoryId] }),
  }),
);

export const categoryRelations = relations(category, ({ many }) => ({
  recordsToCategories: many(recordsToCategories),
}));
