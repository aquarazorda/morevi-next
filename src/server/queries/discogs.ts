"use server";

import { type ZodObject, type ZodRawShape } from "zod";
import { env } from "~/env";
import {
  foldersResponseSchema,
  folderReleasesSchema,
} from "../schemas/discogs/folders";
import { releaseSchema } from "../schemas/discogs/release";
import { discogsSearchResultsSchema } from "../schemas/discogs/search";

const foldersPath = "/users/MoreviTBS/collection/folders";

export const getFolders = () =>
  getDiscogs(foldersPath, foldersResponseSchema).then(
    (res) => res?.folders ?? [],
  );

export const getReleases = (folderId: string) =>
  getDiscogs(
    `${foldersPath}/${folderId}/releases?sort=added&sort_order=desc&per_page=100`,
    folderReleasesSchema,
  );

export const getRelease = (releaseId: string) =>
  getDiscogs(`/releases/${releaseId}`, releaseSchema);

export const getDiscogsSearch = (query: string) =>
  getDiscogs(
    `/database/search?type=release&per_page=50&query=${query}`,
    discogsSearchResultsSchema,
  );

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
      // TODO maybe there's multiple pages
      return schema.parse(await res.json());
    })
    .catch((e) => {
      console.log(JSON.stringify(e));
      return undefined;
    });
