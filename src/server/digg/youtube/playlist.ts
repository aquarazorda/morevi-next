import { Schema } from "@effect/schema";
import { Effect } from "effect";
import { youtube } from "~/server/auth/youtube-oauth";

export const PlaylistInfoSchema = Schema.Struct({
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
          publishedAt: item.snippet?.publishedAt ?? "",
        }),
    );
    playlists = [...playlists, ...newPlaylists];
    nextPageToken = response.data.nextPageToken ?? undefined;
  } while (nextPageToken);

  return playlists.sort((a, b) => a.title.localeCompare(b.title));
});
