"use server";

import WooCommerceRestApi from "@woocommerce/woocommerce-rest-api";
import { revalidateTag, unstable_cache } from "next/cache";
import { env } from "~/env";
import { addReleaseSchema } from "../schemas/discogs/release";
import { type recordCondition } from "../db/schema/record";
import CACHE_TAG from "./cache-tags";
import {
  wcProductListSchema,
  wcProductResponseSchema,
} from "../schemas/woocommerce/product";
import { Effect, Match, identity, pipe } from "effect";
import * as ParseResult from "@effect/schema/ParseResult";
import { Schema } from "@effect/schema";
import { effectToPromise } from "~/server/queries/utils";

const wcApi = new WooCommerceRestApi({
  url: env.WP_HOST,
  consumerKey: env.WP_KEY,
  consumerSecret: env.WP_SECRET,
  version: "wc/v3",
});

const categorySchema = Schema.Struct({
  id: Schema.Number,
  name: Schema.String,
  slug: Schema.String,
  count: Schema.Number,
});

const categoryResponseSchema = Schema.transform(
  Schema.Struct({
    data: Schema.Array(categorySchema),
  }),
  Schema.Array(categorySchema),
  {
    encode: (data) => ({ data }),
    decode: ({ data }) => data,
  },
);

export type Categories = readonly Schema.Schema.Type<typeof categorySchema>[];

export const getWcCategories = async () =>
  unstable_cache(
    () =>
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
        Effect.flatMap(Schema.decodeUnknown(categoryResponseSchema)),
        Effect.either,
        Effect.runPromise,
      ),
    ["getWcCategories"],
    { tags: [CACHE_TAG.WC_CATEGORIES], revalidate: 600 },
  )();

const generateTracklist = (
  tracklist: Schema.Schema.Type<typeof addReleaseSchema>["tracks"],
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
  tracks?: Schema.Schema.Type<typeof addReleaseSchema>["tracks"];
}) => {
  const conditionText = Match.value(condition).pipe(
    Match.when("Mint (M)", () => "ახალი (M)"),
    Match.when("Near Mint (NM or M-)", () => "ახალივით (NM)"),
    Match.orElse((s) => "კარგი (" + s?.split("(")[1]),
  );

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

const addPostTransform = Schema.transform(
  addReleaseSchema,
  Schema.Struct({
    name: Schema.String,
    type: Schema.Literal("simple"),
    status: Schema.Literal("draft", "publish"),
    categories: Schema.Array(Schema.Struct({ id: Schema.Number })),
    regular_price: Schema.optional(Schema.String),
    images: Schema.Array(Schema.Struct({ src: Schema.String })),
    short_description: Schema.String,
    stock_quantity: Schema.Number,
    manage_stock: Schema.Literal(true),
  }),
  {
    decode: ({
      category,
      image,
      price,
      title,
      status,
      stock_quantity,
      ...rest
    }) => ({
      type: "simple" as const,
      name: title,
      status: status === "draft" ? ("draft" as const) : ("publish" as const),
      categories: category.map((id) => ({ id })),
      images: [{ src: image }],
      regular_price: price,
      stock_quantity,
      manage_stock: true,
      short_description: generateDescription(rest),
    }),
    encode: identity,
    strict: false,
  },
);

export const addProductToWc = async (
  product: Schema.Schema.Type<typeof addReleaseSchema>,
) =>
  pipe(
    product,
    ParseResult.decodeUnknown(addPostTransform),
    ParseResult.mapError(() => "Error parsing product data."),
    Effect.tap(Effect.log),
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
    effectToPromise,
  );

export const getWcProductsFromDate = async (date: string) =>
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
    effectToPromise,
  );

export const getWcProducts = async (page: number) =>
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
    Effect.either,
    Effect.runPromise,
  );
