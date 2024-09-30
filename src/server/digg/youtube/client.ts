"use server";

import { inArray } from "drizzle-orm";
import { Effect } from "effect";
import { validateRequest } from "~/server/auth/utils";
import { db } from "~/server/db";
import { youtubeFavoritePlaylist } from "~/server/db/schema/youtube";

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
