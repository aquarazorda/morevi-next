import { Effect } from "effect";
import { unstable_cache } from "next/cache";
import { cache } from "react";
import { validateRequest } from "~/server/auth/utils";
import { getYoutubeChannelId } from "~/server/auth/youtube-oauth";
import { db } from "~/server/db";
import { withYoutubeAuth } from "~/server/digg/youtube/auth-middleware";
import { getUserPlaylists } from "~/server/digg/youtube/playlist";

export type PlaylistFavourites = Effect.Effect.Success<
  ReturnType<typeof $getFavoriteYoutubePlaylists>
>;

export const $getUserPlaylists = withYoutubeAuth(
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
  }).pipe(Effect.mapError(() => Effect.succeed([]))),
);
