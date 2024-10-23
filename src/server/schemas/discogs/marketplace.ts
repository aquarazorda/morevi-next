import { Schema } from "@effect/schema";

const currencySchema = Schema.Union(
  Schema.Literal("USD"),
  Schema.Literal("EUR"),
  Schema.Literal("GBP"),
);

const listingSchema = Schema.Struct({
  id: Schema.Number,
  condition: Schema.String,
  price: Schema.Struct({
    value: Schema.Number,
    currency: currencySchema,
  }),
  seller: Schema.Struct({
    username: Schema.String,
    rating: Schema.Number,
  }),
  ships_from: Schema.String,
  comments: Schema.String,
});

export const marketplaceListingsSchema = Schema.Struct({
  pagination: Schema.Struct({
    page: Schema.Number,
    pages: Schema.Number,
    per_page: Schema.Number,
    items: Schema.Number,
  }),
  listings: Schema.Array(listingSchema),
});
