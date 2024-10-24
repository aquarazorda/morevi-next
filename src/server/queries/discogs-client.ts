import { Effect } from "effect";
import { pipe } from "effect/Function";
import { getDiscogs } from "./discogs";
import { releaseSchema } from "../schemas/discogs/release";
import { discogsSearchResultsSchema } from "../schemas/discogs/search";

import {
  foldersResponseSchema,
  folderReleasesSchema,
} from "../schemas/discogs/folders";
import { type Schema } from "@effect/schema";

const foldersPath = "/users/MoreviTBS/collection/folders";

export const getFolders = async () =>
  pipe(
    getDiscogs(foldersPath, foldersResponseSchema),
    Effect.catchAll(() =>
      Effect.succeed(
        [] as unknown as Schema.Schema.Type<typeof foldersResponseSchema>,
      ),
    ),
    Effect.runPromise,
  );

export const getReleases = async (folderId: string) =>
  getDiscogs(
    `${foldersPath}/${folderId}/releases?sort=added&sort_order=desc&per_page=100`,
    folderReleasesSchema,
  ).pipe(Effect.either, Effect.runPromise);

export const getRelease = async (releaseId: string) =>
  getDiscogs(`/releases/${releaseId}`, releaseSchema).pipe(
    Effect.either,
    Effect.runPromise,
  );

export const getDiscogsSearch = async (query: string) =>
  getDiscogs(
    `/database/search?type=release&per_page=50&query=${query}`,
    discogsSearchResultsSchema,
  ).pipe(Effect.either, Effect.runPromise);
