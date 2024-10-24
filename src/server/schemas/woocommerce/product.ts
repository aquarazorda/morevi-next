import { identity } from "effect";
import { Schema } from "@effect/schema";

export const wcProductSchema = Schema.Struct({
  id: Schema.Number,
  name: Schema.String,
  slug: Schema.String,
  short_description: Schema.String,
  price: Schema.String,
  images: Schema.Array(Schema.Struct({ src: Schema.String })),
  stock_quantity: Schema.Number,
  date_created: Schema.String,
  categories: Schema.Array(
    Schema.Struct({
      name: Schema.String,
    }),
  ),
});

export const wcProductListSchema = Schema.Array(wcProductSchema);

export const wcProductResponseSchema = Schema.Struct({
  data: Schema.Array(
    Schema.transform(
      wcProductSchema,
      Schema.Struct({
        ...wcProductSchema.fields,
        images: Schema.Array(Schema.Struct({ src: Schema.String })),
      }),
      {
        encode: ({ images, ...rest }) => ({
          image: images[0]?.src,
          ...rest,
        }),
        decode: identity,
        strict: false,
      },
    ),
  ),
});
