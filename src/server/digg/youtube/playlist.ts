import { Schema } from "@effect/schema";
import { inArray } from "drizzle-orm";
import { Effect } from "effect";
import { validateRequest } from "~/server/auth/utils";
import { youtube } from "~/server/auth/youtube-oauth";
import { db } from "~/server/db";
import { youtubeFavoritePlaylist } from "~/server/db/schema/youtube";

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

  return playlists;
});

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
