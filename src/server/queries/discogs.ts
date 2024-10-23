"use server";

import { env } from "~/env";
import {
  foldersResponseSchema,
  folderReleasesSchema,
} from "../schemas/discogs/folders";
import { releaseSchema } from "../schemas/discogs/release";
import { discogsSearchResultsSchema } from "../schemas/discogs/search";
import { pipe, Effect } from "effect";
import type * as S from "@effect/schema/Schema";
import * as ParseResult from "@effect/schema/ParseResult";

const foldersPath = "/users/MoreviTBS/collection/folders";

export const getDiscogs = <A, I>(path: string, schema: S.Schema<A, I, never>) =>
  pipe(
    Effect.tryPromise({
      try: () =>
        fetch("https://api.discogs.com" + path, {
          headers: {
            Authorization: `Discogs token=${env.DISCOGS_TOKEN}`,
          },
          cache: "no-cache",
        }).then((response) => response.json()),
      catch: () => "Error fetching data",
    }),
    Effect.flatMap(ParseResult.decodeUnknown(schema)),
    Effect.mapError((e) => {
      if (typeof e === "string") {
        return e;
      }

      return (e.actual as { message: string }).message + "\n" + path;
    }),
  );

export const getFolders = () =>
  pipe(
    getDiscogs(foldersPath, foldersResponseSchema),
    Effect.catchAll(() =>
      Effect.succeed(
        [] as unknown as S.Schema.Type<typeof foldersResponseSchema>,
      ),
    ),
    Effect.runPromise,
  );

export const getReleases = (folderId: string) =>
  getDiscogs(
    `${foldersPath}/${folderId}/releases?sort=added&sort_order=desc&per_page=100`,
    folderReleasesSchema,
  ).pipe(Effect.either, Effect.runPromise);

export const getRelease = (releaseId: string) =>
  getDiscogs(`/releases/${releaseId}`, releaseSchema).pipe(
    Effect.either,
    Effect.runPromise,
  );

export const getDiscogsSearch = (query: string) =>
  getDiscogs(
    `/database/search?type=release&per_page=50&query=${query}`,
    discogsSearchResultsSchema,
  ).pipe(Effect.either, Effect.runPromise);
