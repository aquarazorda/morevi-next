import type { ZodObject, ZodRawShape } from "zod";
import { env } from "~/env";
import {
  foldersResponseSchema,
  folderReleasesSchema,
} from "../schemas/discogs/folders";
import { releaseSchema } from "../schemas/discogs/release";

export const foldersPath = "/users/MoreviTBS/collection/folders";

export const getFolders = () =>
  getDiscogs(foldersPath, foldersResponseSchema).then(
    (res) => res?.folders ?? [],
  );

export const getReleases = (folderId: string) =>
  getDiscogs(
    `${foldersPath}/${folderId}/releases?sort=added&sort_order=desc`,
    folderReleasesSchema,
  );

export const getRelease = (releaseId: string) =>
  getDiscogs(`/releases/${releaseId}`, releaseSchema);

export const getDiscogs = <T extends ZodRawShape>(
  path: string,
  schema: ZodObject<T>,
) =>
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
    .catch((e) => {
      console.log(e);
      return undefined;
    });
