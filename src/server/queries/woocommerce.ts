import WooCommerceRestApi from "@woocommerce/woocommerce-rest-api";
import { unstable_cache } from "next/cache";
import { z } from "zod";
import { env } from "~/env";

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
