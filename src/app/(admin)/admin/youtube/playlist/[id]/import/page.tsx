import { Schema } from "@effect/schema";
import { Effect } from "effect";
import Link from "next/link";
import { youtube } from "~/server/auth/youtube-oauth";
import { db } from "~/server/db";
import { youtubePlaylist } from "~/server/db/schema";
import { withYoutubeAuth } from "~/server/digg/youtube/auth-middleware";
import { PlaylistInfoSchema } from "~/server/digg/youtube/playlist";
import effectComponent from "~/server/effect";

const getPlaylistInfo = (id: string) =>
  withYoutubeAuth(
    Effect.tryPromise(() =>
      youtube.playlists.list({
        part: ["snippet", "contentDetails"],
        id: [id],
        mine: true,
      }),
    ).pipe(
      Effect.flatMap((res) =>
        Effect.gen(function* () {
          const playlistEncoded = yield* Effect.fromNullable(
            res.data.items?.[0],
          );

          const playlist = yield* Schema.decodeUnknown(
            PlaylistInfoSchema.omit("publishedAt"),
          )({
            id: playlistEncoded.id,
            title: playlistEncoded.snippet?.title,
            description: playlistEncoded.snippet?.description,
            thumbnailUrl: playlistEncoded.snippet?.thumbnails?.default?.url,
            itemCount: playlistEncoded.contentDetails?.itemCount,
          });

          const result = yield* Effect.tryPromise(() =>
            db.insert(youtubePlaylist).values(playlist).returning(),
          ).pipe(
            Effect.map((res) => res[0]),
            Effect.flatMap(Effect.fromNullable),
          );

          return result;
        }),
      ),
    ),
  );

export default effectComponent(({ params }: { params: { id: string } }) =>
  Effect.gen(function* () {
    // const playlist = yield* getPlaylist(params.id);
    const playlistInfo = yield* getPlaylistInfo(params.id);

    return (
      <div className="container mx-auto p-4 pb-20">
        <h1 className="mb-6 flex items-center justify-between text-2xl font-bold">
          Importing playlist - {playlistInfo.title}
        </h1>
        <div className="flex flex-col gap-4"></div>
      </div>
    );
  }).pipe(
    Effect.catchAllCause(() => {
      return Effect.succeed(
        <div className="flex h-screen flex-col items-center justify-center">
          Something went wrong, please try again.{" "}
          <Link prefetch={false} href={`/admin/youtube/playlist/${params.id}`}>
            Go back
          </Link>
        </div>,
      );
    }),
  ),
);
