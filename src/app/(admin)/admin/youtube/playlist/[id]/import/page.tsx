import { Schema } from "@effect/schema";
import { Effect } from "effect";
import PlaylistItem from "~/app/(admin)/admin/youtube/playlist/[id]/import/playlist-item";
import { GeneratorComponent } from "~/components/utils/generator";
import { youtube } from "~/server/auth/youtube-oauth";
import { db } from "~/server/db";
import { youtubePlaylist } from "~/server/db/schema";
import { withYoutubeAuth } from "~/server/digg/youtube/auth-middleware";
import { getPlaylist } from "~/server/digg/youtube/exports";
import { PlaylistInfoSchema } from "~/server/digg/youtube/playlist";
import { getPlaylistItemsStream } from "~/server/digg/youtube/playlist-items";
import effectComponent from "~/server/effect";

const getPlaylistInfo = (id: string) =>
  withYoutubeAuth(
    Effect.tryPromise(() =>
      youtube.playlists.list({
        part: ["snippet", "contentDetails"],
        id: [id],
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
    const playlist = yield* getPlaylist(params.id);
    const stream = yield* getPlaylistItemsStream(playlist.id);

    return (
      <div className="container mx-auto p-4 pb-20">
        <h1 className="mb-6 flex items-center justify-between text-2xl font-bold">
          Importing playlist - {playlist.title}
        </h1>
        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          <GeneratorComponent stream={stream}>
            {(items) =>
              items.map((item) => (
                <PlaylistItem
                  key={item.id}
                  thumbnailUrl={item.thumbnailUrl}
                  title={item.title}
                />
              ))
            }
          </GeneratorComponent>
        </div>
      </div>
    );
  }).pipe(
    Effect.catchTag("PlaylistNotFoundError", () =>
      Effect.gen(function* () {
        const playlistInfo = yield* getPlaylistInfo(params.id);
        return <div>Playlist not found {playlistInfo.title}</div>;
      }),
    ),
  ),
);
