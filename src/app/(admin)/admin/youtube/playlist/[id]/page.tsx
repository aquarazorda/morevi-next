import { format } from "date-fns";
import { Effect, Stream } from "effect";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { GeneratorComponent } from "~/components/utils/generator";
import { getPlaylist, getPlaylistItems } from "~/server/digg/youtube/exports";
import { getPlaylistItemsStream } from "~/server/digg/youtube/playlist-items";
import effectComponent from "~/server/effect";

const StreamablePlaylist = effectComponent(({ id }: { id: string }) =>
  Effect.gen(function* () {
    const playlistStream = yield* getPlaylistItemsStream(id);
    const readable = playlistStream.pipe(
      Stream.map((items) =>
        items.flatMap((item) => <div key={item.id}>{item.title}</div>),
      ),
      Stream.toReadableStream,
    );

    return <GeneratorComponent readable={readable} />;
  }),
);

export default effectComponent(({ params }: { params: { id: string } }) =>
  Effect.gen(function* () {
    const playlist = yield* getPlaylist(params.id);
    const items = yield* getPlaylistItems(params.id);

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
      Effect.succeed(
        <div className="container mx-auto p-4 pb-20">
          <h1 className="mb-6 flex items-center justify-between text-2xl font-bold">
            Fetching playlist items...
          </h1>
          <div className="flex flex-col gap-4">
            <StreamablePlaylist id={params.id} />
          </div>
        </div>,
      ),
    ),
    Effect.catchAllCause(() =>
      Effect.succeed(
        <div className="flex h-full flex-col items-center justify-center gap-4">
          This playlist is not imported yet.
          <Button asChild>
            <Link
              prefetch={false}
              href={`/admin/youtube/playlist/${params.id}/import`}
            >
              Import
            </Link>
          </Button>
        </div>,
      ),
    ),
  ),
);
