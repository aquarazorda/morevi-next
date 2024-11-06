import { Schema } from "@effect/schema";
import { Effect } from "effect";
import { youtube } from "~/server/auth/youtube-oauth";
import { playlistType } from "~/server/db/schema/track";
import { setYoutubeCredentials } from "~/server/digg/youtube";

export const PlaylistInfoSchema = Schema.Struct({
  externalId: Schema.String,
  name: Schema.String,
  description: Schema.String,
  coverUrl: Schema.String,
  itemCount: Schema.Number,
  publishedAt: Schema.String,
  type: Schema.Literal(...playlistType),
});

export type YoutubePlaylistInfo = Schema.Schema.Type<typeof PlaylistInfoSchema>;

export const fetchUserPlaylists = (pageToken?: string) =>
  Effect.gen(function* () {
    const response = yield* Effect.tryPromise(() =>
      youtube.playlists.list({
        part: ["snippet", "contentDetails"],
        mine: true,
        maxResults: 50,
        pageToken,
      }),
    );

    const playlists = yield* Effect.forEach(response.data.items ?? [], (item) =>
      Schema.decodeUnknown(PlaylistInfoSchema)({
        externalId: item.id ?? "",
        name: item.snippet?.title ?? "",
        description: item.snippet?.description ?? "",
        coverUrl: item.snippet?.thumbnails?.default?.url ?? "",
        itemCount: item.contentDetails?.itemCount ?? 0,
        publishedAt: item.snippet?.publishedAt ?? "",
        type: "youtube",
      } satisfies YoutubePlaylistInfo),
    );

    return {
      nextPageToken: response.data.nextPageToken ?? undefined,
      playlists,
    };
  });

export const getUserYoutubePlaylists = Effect.gen(function* () {
  let playlists: YoutubePlaylistInfo[] = [];
  let nextPageToken: string | undefined;
  yield* setYoutubeCredentials();

  do {
    const { playlists: newPlaylists, nextPageToken: newNextPageToken } =
      yield* fetchUserPlaylists(nextPageToken);
    playlists = [...playlists, ...newPlaylists];
    nextPageToken = newNextPageToken;
  } while (nextPageToken);

  return playlists.sort((a, b) => a.name.localeCompare(b.name));
});
