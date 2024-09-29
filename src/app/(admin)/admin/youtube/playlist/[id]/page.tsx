import { format } from "date-fns";
import { Effect } from "effect";
import { Button } from "~/components/ui/button";
import { getPlaylist, getPlaylistItems } from "~/server/digg/youtube/exports";
import effectComponent from "~/server/effect";

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
    Effect.catchAllCause(() =>
      Effect.succeed(
        <div className="flex h-full flex-col items-center justify-center gap-4">
          This playlist is not imported yet.
          <Button>Import</Button>
        </div>,
      ),
    ),
  ),
);
