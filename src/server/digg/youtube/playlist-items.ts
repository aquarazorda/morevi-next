import { Schema } from "@effect/schema";
import { Effect } from "effect";
import { youtube } from "~/server/digg/youtube";
import { runYoutubeAuthEffect } from "~/server/digg/youtube/auth-middleware";

const PlaylistItemSchema = Schema.Struct({
  id: Schema.String,
  title: Schema.String,
  description: Schema.String,
  thumbnailUrl: Schema.String,
});

type PlaylistItem = Schema.Schema.Type<typeof PlaylistItemSchema>;

const extractPlaylistId = (url: string) =>
  Effect.try(() => {
    const regex = /[?&]list=([^#\&\?]+)/;
    const match = regex.exec(url);
    if (!match) throw new Error("Invalid YouTube playlist URL");
    return match[1];
  });

// Function to fetch playlist items
const fetchPlaylistItems = (playlistId: string, pageToken?: string) =>
  Effect.tryPromise(() =>
    youtube.playlistItems.list({
      part: ["snippet"],
      playlistId,
      maxResults: 50,
      pageToken,
    }),
  );

const getPlaylistItems = (playlistUrl: string) =>
  Effect.gen(function* () {
    const playlistId = yield* extractPlaylistId(playlistUrl);
    let items: PlaylistItem[] = [];
    let nextPageToken: string | undefined;

    if (!playlistId) throw new Error("Invalid YouTube playlist URL");

    do {
      const response = yield* fetchPlaylistItems(playlistId, nextPageToken);
      const newItems = yield* Effect.forEach(
        response.data.items ?? [],
        (item) =>
          Schema.decodeUnknown(PlaylistItemSchema)({
            id: item.id ?? "",
            title: item.snippet?.title ?? "",
            description: item.snippet?.description ?? "",
            thumbnailUrl: item.snippet?.thumbnails?.default?.url ?? "",
          }),
      );
      items = [...items, ...newItems];
      nextPageToken = response.data.nextPageToken ?? undefined;
    } while (nextPageToken);

    return items;
  });

const FormDataSchema = Schema.Struct({
  "youtube-playlist-url": Schema.String,
});

export const $getPlaylistItems = async (formData: FormData) =>
  runYoutubeAuthEffect(
    Effect.gen(function* () {
      const validatedData = yield* Schema.decodeUnknownEither(FormDataSchema)(
        Object.fromEntries(formData),
      );
      const playlistUrl = validatedData["youtube-playlist-url"];
      return yield* getPlaylistItems(playlistUrl);
    }),
  );
