import {
  pgTable,
  text,
  integer,
  index,
  jsonb,
  timestamp,
} from "drizzle-orm/pg-core";
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

export const record = pgTable(
  "record",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    labelId: text("label_id").references(() => label.id),
    year: integer("year"),
    catNo: text("cat_no"),
    videos:
      jsonb("videos").$type<
        Array<{ uri: string; title: string; position: string }>
      >(),
    stock: integer("stock").default(0).notNull(),
    condition: text("condition", { enum: recordCondition }),
    status: text("status", { enum: recordStatus }).default("active").notNull(),
    price: text("price").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => ({
    nameIdx: index("record_name_idx").on(table.name),
    slugIdx: index("record_slug_idx").on(table.slug),
  }),
);
