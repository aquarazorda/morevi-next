"use server";

import WooCommerceRestApi from "@woocommerce/woocommerce-rest-api";
import { unstable_cache } from "next/cache";
import { z } from "zod";
import { env } from "~/env";
import { addReleaseSchema } from "../schemas/discogs/release";
import { type recordCondition } from "../db/schema/record";
import { match } from "ts-pattern";
import { chain, tryCatch } from "fp-ts/TaskEither";
import { pipe } from "fp-ts/lib/function";

const wcApi = new WooCommerceRestApi({
  url: env.WP_HOST,
  consumerKey: env.WP_KEY,
  consumerSecret: env.WP_SECRET,
  version: "wc/v3",
});

const categorySchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
  count: z.number(),
});

const categoryResponseSchema = z
  .object({
    data: z.array(categorySchema),
  })
  .transform((data) => data.data);

export type Categories = z.infer<typeof categorySchema>[];

export const getWcCategories = unstable_cache(
  () =>
    wcApi
      .get("products/categories", {
        per_page: 100,
        orderby: "count",
        order: "desc",
      })
      .then((res) => {
        return categoryResponseSchema.parse(res);
      })
      .catch((error: unknown) => {
        console.log(error);

        return [] as Categories;
      }),
  ["getWcCategories"],
  { tags: ["wc-categories"], revalidate: 600 },
);

const generateTracklist = (
  tracklist: z.infer<typeof addReleaseSchema>["tracks"],
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
  tracks?: z.infer<typeof addReleaseSchema>["tracks"];
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

const addPostTransform = addReleaseSchema.transform(
  ({ category, image, price, title, status, ...rest }) => ({
    type: "simple",
    name: title,
    status: status === "draft" ? "draft" : "publish",
    categories: category.map((id) => ({ id })),
    images: [{ src: image }],
    regular_price: price,
    short_description: generateDescription(rest),
  }),
);

export const addProductToWc = (product: z.infer<typeof addReleaseSchema>) =>
  pipe(
    tryCatch(
      () => addPostTransform.parseAsync(product),
      () => "Incorrect product data. Please check the form.",
    ),
    chain((body) =>
      tryCatch(
        () =>
          wcApi
            .post("products", body)
            .then(() => "Product added successfully."),
        () => "Error adding product to WooCommerce. Please try again.",
      ),
    ),
  )();
