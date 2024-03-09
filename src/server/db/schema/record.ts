import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { label } from "./label";

export const recordCondition = [
  "Mint (M)",
  "Near Mint (NM or M-)",
  "Very Good Plus (VG+)",
  "Very Good (VG)",
  "Good Plus (G+)",
  "Good (G)",
  "Fair (F)",
  "Poor (P)",
] as const;

export const recordStatus = ["draft", "active"] as const;

export const record = sqliteTable(
  "record",
  {
    id: text("id").unique().notNull(),
    name: text("name").notNull(),
    slug: text("slug").unique().notNull(),
    labelId: text("label_id").references(() => label.id),
    year: integer("year"),
    catNo: text("cat_no"),
    videos: text("videos", { mode: "json" }).$type<
      Array<{ uri: string; title: string; position: string }>
    >(),
    stock: integer("stock").default(0).notNull(),
    condition: text("condition", { enum: recordCondition }),
    status: text("status", { enum: recordStatus }).default("active").notNull(),
    price: text("price").notNull(),
    createdAt: text("created_at").default(sql`CURRENT_DATE`),
    updatedAt: text("updated_at").default(sql`CURRENT_DATE`),
  },
  (table) => ({
    nameIdx: index("recordNameIdx").on(table.name),
    slugIdx: index("recordSlugIdx").on(table.slug),
  }),
);
