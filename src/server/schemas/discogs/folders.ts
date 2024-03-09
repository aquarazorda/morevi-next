import { z } from "zod";

export const discogsFolderSchema = z.object({
  id: z.number(),
  name: z.string(),
  count: z.number(),
});

export const foldersResponseSchema = z.object({
  folders: z.array(discogsFolderSchema),
});
