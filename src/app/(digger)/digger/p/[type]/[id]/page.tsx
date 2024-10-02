import { Button } from "~/components/ui/button";
import { ScrollArea, ScrollBar } from "~/components/ui/scroll-area";
import { ChevronLeft, ChevronRight, Shuffle } from "lucide-react";
// import { TrackTable } from './track-table';
// import { getPlaylistWithSongs } from '@/lib/db/queries';
import { notFound } from "next/navigation";
import Link from "next/link";
import { type PlaylistType } from "~/server/db/schema/track";
import effectComponent from "~/server/effect";
import { Effect } from "effect";
import { getPlaylistItemsStream } from "~/server/digg/youtube/playlist-items";
import { TrackTable } from "~/app/(digger)/digger/track-table";
import { GeneratorComponent } from "~/components/utils/generator";
import { TrackRow } from "~/app/(digger)/digger/track-row";
// import { formatDuration } from '@/lib/utils';
// import { CoverImage } from './cover-image';
// import { EditableTitle } from './editable-title';

export default effectComponent(
  ({ params }: { params: { id: string; type: PlaylistType } }) =>
    Effect.gen(function* () {
      const items = yield* getPlaylistItemsStream(params.id);

      return (
        <div className="flex flex-1 flex-col overflow-hidden bg-[#0A0A0A] pb-[69px]">
          <div className="flex items-center justify-between bg-[#0A0A0A] p-3">
            <div className="flex items-center space-x-1">
              <Link href="/" passHref>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </Link>
              <Button variant="ghost" size="icon" className="h-7 w-7" disabled>
                <ChevronRight className="h-4 w-4" />
              </Button>
              {/* <span className="text-sm">{playlist.name}</span> */}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="secondary"
                className="h-7 bg-[#282828] text-xs text-white hover:bg-[#3E3E3E]"
              >
                Play All
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <Shuffle className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center space-x-3 bg-[#0A0A0A] px-4 py-3">
            {/* <CoverImage url={playlist.coverUrl} playlistId={playlist.id} />
        <div>
          <EditableTitle playlistId={playlist.id} initialName={playlist.name} />
          <p className="text-xs sm:text-sm text-gray-400">
            {playlist.trackCount} tracks • {formatDuration(playlist.duration)}
          </p>
        </div> */}
          </div>

          <ScrollArea className="mt-3 flex-1">
            <div className="min-w-max" suppressHydrationWarning>
              <TrackTable>
                <GeneratorComponent stream={items}>
                  {(playlistItems) => (
                    console.log(playlistItems.length),
                    playlistItems.map((track, index) => (
                      <TrackRow
                        key={track.id}
                        track={track}
                        index={index}
                        query={""}
                        isSelected={false}
                        // isSelected={selectedTrackId === track.id}
                        // onSelect={() => setSelectedTrackId(track.id)}
                      />
                    ))
                  )}
                </GeneratorComponent>
              </TrackTable>
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      );
    }),
);
