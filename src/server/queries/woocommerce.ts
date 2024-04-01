"use server";

import WooCommerceRestApi from "@woocommerce/woocommerce-rest-api";
import { revalidateTag, unstable_cache } from "next/cache";
import { env } from "~/env";
import { addReleaseSchema } from "../schemas/discogs/release";
import { type recordCondition } from "../db/schema/record";
import { match } from "ts-pattern";
import CACHE_TAG from "./cache-tags";
import {
  wcProductListSchema,
  wcProductResponseSchema,
} from "../schemas/woocommerce/product";
import * as S from "@effect/schema/Schema";
import { Effect, pipe } from "effect";
import { identity } from "fp-ts/lib/function";
import * as ParseResult from "@effect/schema/ParseResult";

const wcApi = new WooCommerceRestApi({
  url: env.WP_HOST,
  consumerKey: env.WP_KEY,
  consumerSecret: env.WP_SECRET,
  version: "wc/v3",
});

const categorySchema = S.struct({
  id: S.number,
  name: S.string,
  slug: S.string,
  count: S.number,
});

const categoryResponseSchema = S.struct({
  data: S.array(categorySchema),
}).pipe(
  S.transform(
    S.array(categorySchema),
    (data) => data.data,
    (data) => ({ data }),
  ),
);

export type Categories = S.Schema.Type<typeof categorySchema>[];

export const getWcCategories = unstable_cache(
  () =>
    Effect.runPromiseExit(
      pipe(
        Effect.tryPromise({
          try: () =>
            wcApi.get("products/categories", {
              per_page: 100,
              orderby: "count",
              order: "desc",
            }),
          catch: (e) => e,
        }),
        S.decodeUnknown(categoryResponseSchema),
      ),
    ),
  ["getWcCategories"],
  { tags: [CACHE_TAG.WC_CATEGORIES], revalidate: 600 },
);

const generateTracklist = (
  tracklist: S.Schema.Type<typeof addReleaseSchema>["tracks"],
) => {
  if (!tracklist) return "";

  return `<table class="playlist">
<tbody>
${tracklist
  .map(
    ({ position, title, duration, link }) => `<tr class="tracklist_track track">
<td class="tracklist_track_pos">${position}</td>
<td class="track tracklist_track_title"><a href="${link}" target="_blank" rel="noopener noreferrer">${title}${duration ? " " + duration : ""}</a></td>
</tr>`,
  )
  .join("")}
</tbody>
</table>`;
};

const generateDescription = ({
  label,
  catno,
  year,
  tracks,
  condition,
}: {
  year?: number;
  label?: string;
  catno?: string;
  condition?: (typeof recordCondition)[number];
  tracks?: S.Schema.Type<typeof addReleaseSchema>["tracks"];
}) => {
  const conditionText = match(condition)
    .with("Mint (M)", () => "ახალი (M)")
    .with("Near Mint (NM or M-)", () => "ახალივით (NM)")
    .otherwise((s) => "კარგი (" + s?.split("(")[1]);

  const res = [
    label ? `ლეიბლი - ${label}${catno ? " / " + catno : ""}` : "",
    year ? `წელი - ${year}` : "",
    tracks ? generateTracklist(tracks) : "",
    condition
      ? `მდგომარეობა <strong><span style="color: #339966">${conditionText}</span></strong>`
      : "",
  ];

  return res.filter(Boolean).join("\n");
};

const addPostTransform = addReleaseSchema.pipe(
  S.transform(
    S.struct({
      type: S.literal("simple"),
      status: S.literal("draft", "publish"),
      categories: S.array(S.struct({ id: S.number })),
      regular_price: S.optional(S.string),
      images: S.array(S.struct({ src: S.string })),
      short_description: S.string,
    }),
    ({ category, image, price, title, status, ...rest }) => ({
      type: "simple" as const,
      name: title,
      status: status === "draft" ? ("draft" as const) : ("publish" as const),
      categories: category.map((id) => ({ id })),
      images: [{ src: image }],
      regular_price: price,
      short_description: generateDescription(rest),
    }),
    identity,
    { strict: false },
  ),
);
export const addProductToWc = (
  product: S.Schema.Type<typeof addReleaseSchema>,
) =>
  pipe(
    product,
    ParseResult.decodeUnknown(addPostTransform),
    ParseResult.mapError(() => "Error parsing product data."),
    Effect.flatMap((body) =>
      Effect.tryPromise({
        try: () =>
          wcApi.post("products", body).then(() => {
            revalidateTag(CACHE_TAG.WC_CATEGORIES);
            return "Product added successfully.";
          }),
        catch: () => "Error adding product to WooCommerce. Please try again.",
      }),
    ),
  );

export const getWcProductsFromDate = (date: string) =>
  pipe(
    Effect.tryPromise({
      try: () =>
        wcApi.get("products", {
          after: date,
          per_page: 100,
          status: "publish",
          stock_status: "instock",
        }),
      catch: () => "Error fetching products from WooCommerce.",
    }),
    ParseResult.decodeUnknown(wcProductListSchema),
    ParseResult.mapError(() => "Error parsing products from WooCommerce."),
  );

export const getWcProducts = (page: number) =>
  pipe(
    Effect.tryPromise({
      try: () =>
        wcApi.get("products", {
          per_page: 10,
          page,
          status: "publish",
          stock_status: "instock",
        }),
      catch: () => "Error fetching products from WooCommerce.",
    }),
    ParseResult.decodeUnknown(wcProductResponseSchema),
    ParseResult.mapError(() => "Error parsing products from WooCommerce."),
  );
