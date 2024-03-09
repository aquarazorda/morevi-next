import { z } from "zod";

export const discogsFolderSchema = z.object({
  id: z.number(),
  name: z.string(),
  count: z.number(),
});

export const foldersResponseSchema = z.object({
  folders: z.array(discogsFolderSchema),
});

export const basicInformationSchema = z.object({
  id: z.number(),
  title: z.string(),
  artists: z.array(
    z.object({
      name: z.string(),
    }),
  ),
  thumb: z.string().optional(),
  cover_image: z.string().optional(),
  year: z.number().optional(),
  genres: z.array(z.string()).optional(),
  styles: z.array(z.string()).optional(),
  labels: z.array(
    z.object({
      id: z.number(),
      name: z.string(),
      catno: z.string(),
    }),
  ),
});

export const folderReleasesSchema = z.object({
  pagination: z.object({
    page: z.number(),
    pages: z.number(),
    per_page: z.number(),
    items: z.number(),
  }),
  releases: z.array(
    z
      .object({
        basic_information: basicInformationSchema,
      })
      .transform(({ basic_information }) => basic_information),
  ),
});
