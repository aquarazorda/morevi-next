"use server";

import { Schema } from "@effect/schema";
import { inArray } from "drizzle-orm";
import { Effect } from "effect";
import { unstable_cache } from "next/cache";
import { cache } from "react";
import { validateRequest } from "~/server/auth/utils";
import { getYoutubeChannelId, youtube } from "~/server/auth/youtube-oauth";
import { db } from "~/server/db";
import { youtubeFavoritePlaylist } from "~/server/db/schema/youtube";
import { runYoutubeAuthEffect } from "~/server/digg/youtube/auth-middleware";

const PlaylistInfoSchema = Schema.Struct({
  id: Schema.String,
  name: Schema.String,
  description: Schema.String,
  thumbnailUrl: Schema.String,
  itemCount: Schema.Number,
  publishedAt: Schema.String,
});

export type PlaylistInfo = Schema.Schema.Type<typeof PlaylistInfoSchema>;
export type PlaylistFavourites = Awaited<
  ReturnType<typeof $getFavoriteYoutubePlaylists>
>;

const fetchUserPlaylists = (pageToken?: string) =>
  Effect.tryPromise(() =>
    youtube.playlists.list({
      part: ["snippet", "contentDetails"],
      mine: true,
      maxResults: 50,
      pageToken,
    }),
  );

const getUserPlaylists = Effect.gen(function* () {
  let playlists: PlaylistInfo[] = [];
  let nextPageToken: string | undefined;

  do {
    const response = yield* fetchUserPlaylists(nextPageToken);
    const newPlaylists = yield* Effect.forEach(
      response.data.items ?? [],
      (item) =>
        Schema.decodeUnknown(PlaylistInfoSchema)({
          id: item.id ?? "",
          name: item.snippet?.title ?? "",
          description: item.snippet?.description ?? "",
          thumbnailUrl: item.snippet?.thumbnails?.default?.url ?? "",
          itemCount: item.contentDetails?.itemCount ?? 0,
          publishedAt: item.snippet?.publishedAt ?? "",
        }),
    );
    playlists = [...playlists, ...newPlaylists];
    nextPageToken = response.data.nextPageToken ?? undefined;
  } while (nextPageToken);

  return playlists;
});

export const $getUserPlaylists = () =>
  runYoutubeAuthEffect(
    Effect.gen(function* () {
      const channelId = yield* getYoutubeChannelId();
      const res = yield* Effect.tryPromise(
        unstable_cache(
          () => getUserPlaylists.pipe(Effect.runPromise),
          ["playlist", channelId],
          {
            tags: ["playlist"],
          },
        ),
      );

      return res;
    }),
  );

export const $getFavoriteYoutubePlaylists = cache((_userId?: string) =>
  Effect.gen(function* () {
    let userId = _userId;

    if (!userId) {
      const { user } = yield* validateRequest();
      userId = user.id;
    }

    const res = yield* Effect.tryPromise(() =>
      db.query.youtubeFavoritePlaylist.findMany({
        where: (item, { eq }) => eq(item.userId, userId),
      }),
    );

    return res;
  }).pipe(
    Effect.mapError(() => Effect.succeed([])),
    Effect.runPromise,
  ),
);

export const $updateFavoriteYoutubePlaylists = (
  selectedPlaylists: { id: string; name: string }[],
  initialSelection: { id: string; name: string }[],
) =>
  Effect.gen(function* () {
    const { user } = yield* validateRequest();

    const playlistsToAdd = selectedPlaylists
      .filter((playlist) => !initialSelection.some((p) => p.id === playlist.id))
      .map((playlist) => ({
        playlistId: playlist.id,
        userId: user.id,
        name: playlist.name,
      }));

    const playlistsToRemove = initialSelection.filter(
      (playlist) => !selectedPlaylists.some((p) => p.id === playlist.id),
    );

    const res = yield* Effect.tryPromise(() =>
      db.transaction(async (tx) => {
        if (playlistsToAdd.length > 0) {
          console.log("playlistsToAdd", playlistsToAdd);
          await tx.insert(youtubeFavoritePlaylist).values(playlistsToAdd);
        }

        if (playlistsToRemove.length > 0) {
          await tx.delete(youtubeFavoritePlaylist).where(
            inArray(
              youtubeFavoritePlaylist.playlistId,
              playlistsToRemove.map((p) => p.id),
            ),
          );
        }

        return await tx.query.youtubeFavoritePlaylist.findMany({
          where: (item, { eq }) => eq(item.userId, user.id),
        });
      }),
    );

    return res.map((item) => ({
      id: item.playlistId,
      name: item.name,
    }));
  }).pipe(
    Effect.tapError(Effect.logError),
    Effect.catchAll(() => Effect.succeed(null)),
    Effect.runPromise,
  );
