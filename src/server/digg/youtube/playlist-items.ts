import { Schema } from "@effect/schema";
import { Effect, Stream, Option } from "effect";
import { youtube } from "~/server/auth/youtube-oauth";
import { withYoutubeAuth } from "~/server/digg/youtube/auth-middleware";
import { db } from "~/server/db";
import { youtubePlaylist } from "~/server/db/schema/youtube";
import { eq } from "drizzle-orm";

const PlaylistItemSchema = Schema.Struct({
  id: Schema.String,
  title: Schema.String,
  description: Schema.String,
  thumbnailUrl: Schema.String,
});

type PlaylistItem = Schema.Schema.Type<typeof PlaylistItemSchema>;

// Function to fetch playlist items from YouTube API
const fetchPlaylistItems = (playlistId: string, pageToken?: string) =>
  Effect.tryPromise(() =>
    youtube.playlistItems.list({
      part: ["snippet"],
      playlistId,
      maxResults: 50,
      pageToken,
    }),
  );

// Function to get playlist items from the database
// const getPlaylistItemsFromDb = (playlistId: string) =>
//   Effect.tryPromise(() =>
//     db
//       .select()
//       .from(youtubePlaylistItem)
//       .where(eq(youtubePlaylistItem.id, playlistId)),
//   );

// Function to insert playlist items into the database
// const insertPlaylistItems = (items: PlaylistItem[], playlistId: string) =>
//   Effect.tryPromise(() =>
//     db
//       .insert(youtubePlaylistItem)
//       .values(
//         items.map((item) => ({
//           ...item,
//           playlistId,
//         })),
//       )
//       .onConflictDoNothing(),
//   );

// Stream to fetch and insert playlist items
export const fetchAndInsertPlaylistItems = (playlistId: string) =>
  Stream.paginateEffect(undefined as string | undefined, (pageToken) =>
    Effect.gen(function* () {
      const response = yield* fetchPlaylistItems(playlistId, pageToken);
      const items = yield* Effect.forEach(response.data.items ?? [], (item) =>
        Schema.decodeUnknown(PlaylistItemSchema)({
          id: item.id ?? "",
          title: item.snippet?.title ?? "",
          description: item.snippet?.description ?? "",
          thumbnailUrl: item.snippet?.thumbnails?.default?.url ?? "",
        } satisfies PlaylistItem),
      );
      // yield* insertPlaylistItems(items, playlistId);

      return [items, Option.fromNullable(response.data.nextPageToken)] as const;
    }),
  );

export const getPlaylistItemsStream = (playlistId: string) =>
  withYoutubeAuth(
    Effect.gen(function* () {
      const existingPlaylist = yield* Effect.tryPromise(() =>
        db.query.youtubePlaylist.findFirst({
          where: eq(youtubePlaylist.id, playlistId),
          with: {
            items: true,
          },
        }),
      ).pipe(
        Effect.flatMap(Effect.fromNullable),
        Effect.map(({ items }) =>
          items.map(
            (item) =>
              ({
                id: item.id,
                title: item.title,
                description: item.description,
                thumbnailUrl: item.thumbnailUrl,
              }) as const,
          ),
        ),
        Effect.catchAll(() => Effect.succeed([])),
      );

      if (existingPlaylist.length > 0) {
        return Stream.fromIterable([existingPlaylist]);
      } else {
        return fetchAndInsertPlaylistItems(playlistId);
      }
    }),
  );
