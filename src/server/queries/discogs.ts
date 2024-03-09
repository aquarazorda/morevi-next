import { type ZodSchema } from "zod";
import { env } from "~/env";
import { foldersResponseSchema } from "../schemas/discogs/folders";

export const foldersPath = "/users/MoreviTBS/collection/folders";

export const getFolders = () =>
  getDiscogs(foldersPath, foldersResponseSchema).then(
    (res) => res?.folders ?? [],
  );

export const getDiscogs = <T>(path: string, schema: ZodSchema<T>) =>
  fetch("https://api.discogs.com" + path, {
    headers: {
      Authorization: `Discogs token=${env.DISCOGS_TOKEN}`,
    },
    next: {
      revalidate: 3600,
    },
  })
    .then(async (res) => {
      return schema.parse(await res.json());
    })
    .catch(() => {
      return undefined;
    });
