import { removeNumberInParentheses } from "~/lib/utils";
import { Schema } from "@effect/schema";

export const addReleaseSchema = Schema.Struct({
  id: Schema.String,
  title: Schema.String,
  image: Schema.String.pipe(Schema.startsWith("http")),
  artists: Schema.optional(Schema.Array(Schema.String)),
  labelId: Schema.String,
  year: Schema.Number,
  catno: Schema.optional(Schema.String),
  label: Schema.optional(Schema.String),
  tracks: Schema.optional(
    Schema.Array(
      Schema.Struct({
        position: Schema.String,
        title: Schema.String,
        duration: Schema.optional(Schema.String),
        link: Schema.optional(Schema.String),
      }),
    ),
  ),
  stock_quantity: Schema.Number,
  condition: Schema.Literal(
    "Mint (M)",
    "Near Mint (NM or M-)",
    "Very Good Plus (VG+)",
    "Very Good (VG)",
    "Good Plus (G+)",
    "Good (G)",
    "Fair (F)",
    "Poor (P)",
  ),
  status: Schema.Literal("draft", "active"),
  price: Schema.optional(Schema.String),
  category: Schema.Array(Schema.Number),
});

export const discogsLabelSchema = Schema.Struct({
  id: Schema.Number,
  name: Schema.transform(Schema.String, Schema.String, {
    decode: (name) => removeNumberInParentheses(name),
    encode: (name) => name,
  }),
  catno: Schema.optional(Schema.String),
});

export const releaseImages = Schema.optional(
  Schema.Array(
    Schema.Struct({
      type: Schema.Literal("primary", "secondary"),
      uri: Schema.String.pipe(Schema.startsWith("http")),
    }),
  ),
);

export const discogsTracklistSchema = Schema.optional(
  Schema.Array(
    Schema.Struct({
      position: Schema.String,
      title: Schema.String,
      duration: Schema.optional(Schema.String),
    }),
  ),
);

export const releaseSchema = Schema.Struct({
  id: Schema.Number,
  year: Schema.Number,
  title: Schema.String,
  artists: Schema.Array(
    Schema.Struct({
      name: Schema.transform(Schema.String, Schema.String, {
        decode: (name) => removeNumberInParentheses(name),
        encode: (name) => name,
      }),
    }),
  ),
  labels: Schema.Array(discogsLabelSchema),
  genres: Schema.optional(Schema.Array(Schema.String)),
  styles: Schema.optional(Schema.Array(Schema.String)),
  tracklist: discogsTracklistSchema,
  images: releaseImages,
  videos: Schema.optional(
    Schema.Array(
      Schema.Struct({
        uri: Schema.String.pipe(Schema.startsWith("http")),
        title: Schema.String,
      }),
    ),
  ),
});
