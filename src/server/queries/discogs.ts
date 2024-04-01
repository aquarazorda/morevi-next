"use server";

import { env } from "~/env";
import {
  foldersResponseSchema,
  folderReleasesSchema,
} from "../schemas/discogs/folders";
import { releaseSchema } from "../schemas/discogs/release";
import { discogsSearchResultsSchema } from "../schemas/discogs/search";
import { pipe, Effect } from "effect";
import { FetchError } from "~/lib/errors";
import type * as S from "@effect/schema/Schema";
import * as ParseResult from "@effect/schema/ParseResult";

const foldersPath = "/users/MoreviTBS/collection/folders";

export const getDiscogs = <A, I, R>(path: string, schema: S.Schema<A, I, R>) =>
  pipe(
    Effect.tryPromise({
      try: () =>
        fetch("https://api.discogs.com" + path, {
          headers: {
            Authorization: `Discogs token=${env.DISCOGS_TOKEN}`,
          },
          next: {
            revalidate: 3600,
          },
        }),
      catch: (e) => new FetchError(e),
    }),
    ParseResult.decodeUnknown(schema),
  );

export const getFolders = pipe(
  getDiscogs(foldersPath, foldersResponseSchema),
  Effect.catchAll(() =>
    Effect.succeed(
      [] as unknown as S.Schema.Type<typeof foldersResponseSchema>,
    ),
  ),
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
