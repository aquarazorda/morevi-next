import { format } from "date-fns";
import { Effect } from "effect";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { GeneratorComponent } from "~/components/utils/generator";
import { getPlaylist, getPlaylistItems } from "~/server/digg/youtube/exports";
import { getPlaylistItemsStream } from "~/server/digg/youtube/playlist-items";
import effectComponent from "~/server/effect";

const StreamablePlaylist = effectComponent(({ id }: { id: string }) =>
  Effect.gen(function* () {
    const playlistStream = yield* getPlaylistItemsStream(id);

    return (
      <GeneratorComponent stream={playlistStream}>
        {(items) => (
          <div>
            {items.map((item) => (
              <div key={item.id}>{item.title}</div>
            ))}
          </div>
        )}
      </GeneratorComponent>
    );
  }),
);

export default effectComponent(
  ({ params }: { params: Promise<{ id: string }> }) =>
    Effect.gen(function* () {
      const { id } = yield* Effect.tryPromise(() => params);
      const playlist = yield* getPlaylist(id);
      const items = yield* getPlaylistItems(id);

      return (
        <div className="container mx-auto p-4 pb-20">
          <h1 className="mb-6 flex items-center justify-between text-2xl font-bold">
            {playlist.title} / Last updated:{" "}
            {format(playlist.updatedAt, "dd/MM/yyyy")} / {items.length} items
          </h1>
          <div className="flex flex-col gap-4"></div>
        </div>
      );
    }).pipe(
      Effect.catchTag("PlaylistEmptyError", () =>
        Effect.gen(function* () {
          const { id } = yield* Effect.tryPromise(() => params);

          return Effect.succeed(
            <div className="container mx-auto p-4 pb-20">
              <h1 className="mb-6 flex items-center justify-between text-2xl font-bold">
                Fetching playlist items...
              </h1>
              <div className="flex flex-col gap-4">
                <StreamablePlaylist id={id} />
              </div>
            </div>,
          );
        }),
      ),
      Effect.catchAllCause(() =>
        Effect.gen(function* () {
          const { id } = yield* Effect.tryPromise(() => params);

          return Effect.succeed(
            <div className="flex h-full flex-col items-center justify-center gap-4">
              This playlist is not imported yet.
              <Button asChild>
                <Link
                  prefetch={false}
                  href={`/admin/youtube/playlist/${id}/import`}
                >
                  Import
                </Link>
              </Button>
            </div>,
          );
        }),
      ),
    ),
);
