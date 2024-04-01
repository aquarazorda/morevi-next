import * as S from "@effect/schema/Schema";
import { identity } from "effect";

export const wcProductSchema = S.struct({
  id: S.number,
  name: S.string,
  slug: S.string,
  short_description: S.string,
  price: S.string,
  images: S.array(S.struct({ src: S.string })),
  stock_quantity: S.number,
  date_created: S.string,
  categories: S.array(
    S.struct({
      name: S.string,
    }),
  ),
});

export const wcProductListSchema = S.array(wcProductSchema);

export const wcProductResponseSchema = S.struct({
  data: S.array(
    wcProductSchema.pipe(
      S.transform(
        S.struct({
          ...wcProductSchema.fields,
          images: S.array(S.struct({ src: S.string })),
        }),
        ({ images, ...rest }) => ({
          image: images[0]?.src,
          ...rest,
        }),
        identity,
        { strict: false },
      ),
    ),
  ),
});
