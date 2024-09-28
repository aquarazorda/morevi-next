import { Schema } from "@effect/schema";
import { Effect } from "effect";
import { unstable_cache } from "next/cache";
import { cache } from "react";
import { validateRequest } from "~/server/auth/utils";
import { getYoutubeChannelId, youtube } from "~/server/auth/youtube-oauth";
import { db } from "~/server/db";
import { runYoutubeAuthEffect } from "~/server/digg/youtube/auth-middleware";

const PlaylistInfoSchema = Schema.Struct({
  id: Schema.String,
  title: Schema.String,
  description: Schema.String,
  thumbnailUrl: Schema.String,
  itemCount: Schema.Number,
  publishedAt: Schema.String,
});

export type PlaylistInfo = Schema.Schema.Type<typeof PlaylistInfoSchema>;

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
          title: item.snippet?.title ?? "",
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

export const $getFavoriteYoutubePlaylists = cache(() =>
  Effect.gen(function* () {
    const { user } = yield* validateRequest();
    const res = yield* Effect.tryPromise(() =>
      db.query.youtubeFavoritePlaylist.findMany({
        where: (item, { eq }) => eq(item.userId, user.id),
      }),
    ).pipe(
      Effect.map((res) => res.map((item) => item.playlistId)),
      Effect.catchAll(() => Effect.succeed([] as string[])),
    );

    return res;
  }).pipe(Effect.runPromise),
);
