import { Schema } from "@effect/schema";

export const priceStatisticsSchema = Schema.Struct({
  "Very Good (VG)": Schema.Struct({
    currency: Schema.String,
    value: Schema.Number,
  }),
  "Very Good Plus (VG+)": Schema.Struct({
    currency: Schema.String,
    value: Schema.Number,
  }),
  "Near Mint (NM or M-)": Schema.Struct({
    currency: Schema.String,
    value: Schema.Number,
  }),
  "Mint (M)": Schema.Struct({
    currency: Schema.String,
    value: Schema.Number,
  }),
});
