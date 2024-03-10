import { z } from "zod";
import { removeNumberInParentheses } from "~/lib/utils";

export const discogsSearchResultSchema = z.object({
  catno: z.string().optional(),
  cover_image: z.string().optional(),
  thumb: z.string().optional(),
  genre: z.array(z.string()).optional(),
  style: z.array(z.string()).optional(),
  id: z.number(),
  title: z.string().transform((title) =>
    title
      .split("-")
      .map((s, i) => (i === 0 ? removeNumberInParentheses(s) : s))
      .join(" - "),
  ),
  label: z.array(z.string()),
  year: z.string().optional(),
});

export const discogsSearchResultsSchema = z.object({
  pagination: z.object({
    page: z.number(),
    pages: z.number(),
    per_page: z.number(),
    items: z.number(),
  }),
  results: z.array(discogsSearchResultSchema),
});
