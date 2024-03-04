import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { label } from "./label";

export const record = sqliteTable(
  "record",
  {
    id: text("id").unique().notNull(),
    name: text("name").notNull(),
    slug: text("slug").unique().notNull(),
    labelId: text("label_id").references(() => label.id),
    year: integer("year"),
    catNo: text("cat_no"),
    createdAt: text("created_at").default(sql`CURRENT_DATE`),
    updatedAt: text("updated_at").default(sql`CURRENT_DATE`),
  },
  (table) => ({
    nameIdx: index("recordNameIdx").on(table.name),
    slugIdx: index("recordSlugIdx").on(table.slug),
  }),
);
