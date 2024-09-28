import { Schema } from "@effect/schema";
import { Effect } from "effect";
import { unstable_cache } from "next/cache";
import { getYoutubeChannelId } from "~/server/auth/youtube-oauth";
import { youtube } from "~/server/digg/youtube";
import { runYoutubeAuthEffect } from "~/server/digg/youtube/auth-middleware";

const PlaylistInfoSchema = Schema.Struct({
  id: Schema.String,
  title: Schema.String,
  description: Schema.String,
  thumbnailUrl: Schema.String,
  itemCount: Schema.Number,
});

type PlaylistInfo = Schema.Schema.Type<typeof PlaylistInfoSchema>;

const fetchUserPlaylists = (pageToken?: string) =>
  Effect.tryPromise(() =>
    youtube.playlists.list({
      part: ["snippet", "contentDetails"],
      mine: true,
      maxResults: 50,
      pageToken,
    }),
  );

export const getUserPlaylists = Effect.gen(function* () {
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
