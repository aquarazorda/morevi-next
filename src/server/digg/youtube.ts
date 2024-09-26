import { Effect } from "effect";
import { google } from "googleapis";

// Define the interface for a playlist item
interface PlaylistItem {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
}

// Create a YouTube client
const youtube = google.youtube({
  version: "v3",
  auth: process.env.YOUTUBE_API_KEY, // Make sure to set this in your .env file
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

// Main function to get playlist items
export const getPlaylistItems = (playlistUrl: string) =>
  Effect.gen(function* () {
    const playlistId = yield* extractPlaylistId(playlistUrl);
    let items: PlaylistItem[] = [];
    let nextPageToken: string | undefined;

    if (!playlistId) throw new Error("Invalid YouTube playlist URL");

    do {
      const response = yield* fetchPlaylistItems(playlistId, nextPageToken);
      const newItems = (response.data.items ?? []).map((item) => ({
        id: item.id ?? "",
        title: item.snippet?.title ?? "",
        description: item.snippet?.description ?? "",
        thumbnailUrl: item.snippet?.thumbnails?.default?.url ?? "",
      }));
      items = [...items, ...newItems];
      nextPageToken = response.data.nextPageToken ?? undefined;
    } while (nextPageToken);

    return items;
  });

// Usage example (this would typically be in another file)
// const playlistUrl = 'https://www.youtube.com/playlist?list=PLxxxxxxxxxxxxxxx';
// const program = Effect.runPromise(getPlaylistItems(playlistUrl));
// program.then(console.log).catch(console.error);
