"use server";

import { Effect } from "effect";
import { Schema } from "@effect/schema";
import { google } from "googleapis";
import { env } from "~/env";
import { cookies } from "next/headers";

// Define schemas for playlist item and playlist info
const PlaylistItemSchema = Schema.Struct({
  id: Schema.String,
  title: Schema.String,
  description: Schema.String,
  thumbnailUrl: Schema.String,
});

const PlaylistInfoSchema = Schema.Struct({
  id: Schema.String,
  title: Schema.String,
  description: Schema.String,
  thumbnailUrl: Schema.String,
  itemCount: Schema.Number,
});

// Use these schemas to define the types
type PlaylistItem = Schema.Schema.Type<typeof PlaylistItemSchema>;
type PlaylistInfo = Schema.Schema.Type<typeof PlaylistInfoSchema>;

// Create a new OAuth2 client
const oauth2Client = new google.auth.OAuth2(
  env.YOUTUBE_CLIENT_ID,
  env.YOUTUBE_CLIENT_SECRET,
  env.YOUTUBE_REDIRECT_URI,
);

// Function to set credentials (call this before using the YouTube API)
const setCredentials = Effect.gen(function* () {
  const accessToken = cookies().get("youtube_access_token")?.value;
  const refreshToken = cookies().get("youtube_refresh_token")?.value;

  if (!accessToken || !refreshToken) {
    yield* Effect.fail(new Error("YouTube tokens not found in cookies"));
  }

  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  });
});

// Create a YouTube client with OAuth2 authentication
const youtube = google.youtube({
  version: "v3",
  auth: oauth2Client,
});

// Function to extract playlist ID from URL
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
    yield* setCredentials;
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

export const getPlaylistItemsFormData = (formData: FormData) =>
  Effect.gen(function* () {
    const validatedData = yield* Schema.decodeUnknownEither(FormDataSchema)(
      Object.fromEntries(formData),
    );
    const playlistUrl = validatedData["youtube-playlist-url"];
    return yield* getPlaylistItems(playlistUrl);
  }).pipe(Effect.either, Effect.runPromise);

// New function to fetch user's playlists
const fetchUserPlaylists = (pageToken?: string) =>
  Effect.tryPromise(() =>
    youtube.playlists.list({
      part: ["snippet", "contentDetails"],
      mine: true,
      maxResults: 50,
      pageToken,
    }),
  );

// New function to get all user playlists
const getUserPlaylists = Effect.gen(function* () {
  yield* setCredentials;
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

// Export the new function
export const getUserPlaylistsEffect = Effect.either(getUserPlaylists);
