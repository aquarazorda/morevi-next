import { z } from "zod";
import { removeNumberInParentheses } from "~/lib/utils";
import { recordCondition, recordStatus } from "~/server/db/schema/record";

export const addReleaseSchema = z.object({
  id: z.string(),
  title: z.string(),
  image: z.string().url(),
  artists: z.array(z.string()),
  labelId: z.string(),
  year: z.coerce.number(),
  catno: z.string().optional(),
  tracks: z
    .array(
      z.object({
        position: z.string(),
        title: z.string(),
        duration: z.string().optional(),
        link: z.string().optional(),
      }),
    )
    .optional(),
  stock: z.coerce.number(),
  condition: z.enum(recordCondition),
  status: z.enum(recordStatus),
  price: z.string().optional(),
  category: z.array(z.number()),
});

export const releaseImages = z
  .array(
    z.object({
      type: z.enum(["primary", "secondary"]),
      uri: z.string().url(),
    }),
  )
  .optional();

export const releaseSchema = z.object({
  id: z.number(),
  year: z.number(),
  title: z.string(),
  artists: z.array(
    z.object({
      name: z.string().transform((name) => removeNumberInParentheses(name)),
    }),
  ),
  labels: z.array(
    z.object({
      id: z.number(),
      name: z.string().transform((name) => removeNumberInParentheses(name)),
      catno: z.string().optional(),
    }),
  ),
  genres: z.array(z.string()).optional(),
  styles: z.array(z.string()).optional(),
  tracklist: z
    .array(
      z.object({
        position: z.string(),
        title: z.string(),
        duration: z.string().optional(),
      }),
    )
    .optional(),
  images: releaseImages,
  videos: z
    .array(
      z.object({
        uri: z.string().url(),
        title: z.string(),
      }),
    )
    .optional(),
});
