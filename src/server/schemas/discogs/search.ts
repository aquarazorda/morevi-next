import { Schema } from "@effect/schema";
import { removeNumberInParentheses } from "~/lib/utils";

export const discogsSearchResultSchema = Schema.Struct({
  catno: Schema.optional(Schema.String),
  cover_image: Schema.optional(Schema.String),
  thumb: Schema.optional(Schema.String),
  genre: Schema.optional(Schema.Array(Schema.String)),
  style: Schema.optional(Schema.Array(Schema.String)),
  id: Schema.Number,
  title: Schema.transform(Schema.String, Schema.String, {
    decode: (title) =>
      title
        .split("-")
        .map((s, i) => (i === 0 ? removeNumberInParentheses(s) : s))
        .join(" - "),
    encode: (title) => title,
  }),
  label: Schema.Array(Schema.String),
  year: Schema.optional(Schema.String),
});

export const discogsSearchResultsSchema = Schema.Struct({
  pagination: Schema.Struct({
    page: Schema.Number,
    pages: Schema.Number,
    per_page: Schema.Number,
    items: Schema.Number,
  }),
  results: Schema.Array(discogsSearchResultSchema),
});
