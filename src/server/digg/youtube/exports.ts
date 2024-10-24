import { Effect } from "effect";
import { unstable_cache } from "next/cache";
import { cache } from "react";
import { validateRequest } from "~/server/auth/utils";
import { getYoutubeChannelId } from "~/server/auth/youtube-oauth";
import { db } from "~/server/db";
import { withYoutubeAuth } from "~/server/digg/youtube/auth-middleware";

export type PlaylistFavourites = Effect.Effect.Success<
  ReturnType<typeof $getFavoriteYoutubePlaylists>
>;

class PlaylistNotFoundError {
  _tag = "PlaylistNotFoundError";
}

export const getPlaylist = (id: string) =>
  Effect.tryPromise(() =>
    db.query.youtubePlaylist.findFirst({
      where: (pl, { eq }) => eq(pl.id, id),
    }),
  ).pipe(
    Effect.flatMap(Effect.fromNullable),
    Effect.catchAll(() => Effect.fail(new PlaylistNotFoundError())),
  );

export class PlaylistEmptyError {
  _tag = "PlaylistEmptyError";
}

export const getPlaylistItems = (id: string) =>
  Effect.gen(function* () {
    const res = yield* Effect.tryPromise(() =>
      db.query.youtubePlaylistItem.findMany({
        where: (item, { eq }) => eq(item.id, id),
      }),
    );

    if (res.length === 0) {
      yield* Effect.fail(new PlaylistEmptyError());
    }

    return res;
  }).pipe(Effect.catchAll(() => Effect.fail(new PlaylistEmptyError())));

// export const $getUserPlaylists = withYoutubeAuth(
//   Effect.gen(function* () {
//     const channelId = yield* getYoutubeChannelId();
//     const res = yield* Effect.tryPromise(
//       unstable_cache(
//         () => getPlaylists.pipe(Effect.runPromise),
//         ["playlist", channelId],
//         {
//           tags: ["playlist"],
//         },
//       ),
//     );

//     return res;
//   }),
// );

export const $getFavoriteYoutubePlaylists = cache((_userId?: string) =>
  Effect.gen(function* () {
    let userId = _userId;

    if (!userId) {
      const { user } = yield* validateRequest();
      userId = user.id;
    }

    const res = yield* Effect.tryPromise(() =>
      db.query.youtubeFavoritePlaylist.findMany({
        where: (item, { eq }) => eq(item.userId, userId),
      }),
    );

    return res;
    // TODO
  }).pipe(Effect.mapError(() => Effect.succeed([]))),
);
