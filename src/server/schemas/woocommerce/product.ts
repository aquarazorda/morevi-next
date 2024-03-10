import { z } from "zod";

export const wcProductSchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
  short_description: z.string(),
  price: z.string(),
  images: z.array(z.object({ src: z.string() })),
  stock_quantity: z.number(),
  date_created: z.string(),
  categories: z.array(
    z.object({
      name: z.string(),
    }),
  ),
});

export const wcProductListSchema = z.array(wcProductSchema);
