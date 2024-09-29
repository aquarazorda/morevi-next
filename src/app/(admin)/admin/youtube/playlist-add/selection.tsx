"use client";

import { Effect } from "effect";
import { X } from "lucide-react";
import { use, useMemo, useTransition } from "react";
import { toast } from "sonner";
import { PlaylistsContext } from "~/app/(admin)/admin/youtube/playlist-add/context";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { ScrollArea } from "~/components/ui/scroll-area";
import { $updateFavoriteYoutubePlaylists } from "~/server/digg/youtube/playlist";

const Item = ({ id }: { id: string }) => {
  const { playlists, initialSelection, togglePlaylist, selectedPlaylists } =
    use(PlaylistsContext);

  const playlist = useMemo(
    () => playlists.find((p) => p.id === id),
    [id, playlists],
  );

  const { isRemoved, isAdded } = useMemo(() => {
    const initialSet = new Set(initialSelection.map((p) => p.id));
    const currentSet = new Set(selectedPlaylists.map((p) => p.id));

    return {
      isRemoved: initialSet.has(id) && !currentSet.has(id),
      isAdded: !initialSet.has(id) && currentSet.has(id),
    };
  }, [id, initialSelection, selectedPlaylists]);

  return (
    <Badge
      key={id}
      variant={isRemoved ? "destructive" : isAdded ? "default" : "secondary"}
      className="group h-8 cursor-pointer"
      onClick={() => togglePlaylist(id)}
    >
      {playlist?.name}
      <button className="ml-1 group-hover:text-destructive">
        <X className="h-3 w-3" />
      </button>
    </Badge>
  );
};

export default function YoutubePlaylistSelection() {
  const [isPending, startTransition] = useTransition();
  const {
    selectedPlaylists,
    initialSelection,
    clearAll,
    setSelectedPlaylists,
    setInitialSelection,
  } = use(PlaylistsContext);

  const hasChanges =
    selectedPlaylists.length !== initialSelection.length ||
    selectedPlaylists.some((id) => !initialSelection.includes(id));

  if (!hasChanges) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 border-t bg-background p-4 shadow-lg">
      <div className="container mx-auto flex flex-wrap items-center justify-between gap-2">
        <ScrollArea className="h-fit flex-1">
          <div className="flex flex-wrap gap-2">
            {selectedPlaylists.map(({ id }) => (
              <Item key={id} id={id} />
            ))}
          </div>
        </ScrollArea>
        <div className="contents">
          <Button variant="destructive" onClick={clearAll} disabled={isPending}>
            Clear Changes
            <X className="h-3 w-3" />
          </Button>
          <Button
            loading={isPending}
            onClick={() =>
              startTransition(async () => {
                await Effect.tryPromise(() =>
                  $updateFavoriteYoutubePlaylists(
                    selectedPlaylists,
                    initialSelection,
                  ),
                ).pipe(
                  Effect.flatMap(Effect.fromNullable),
                  Effect.tap((res) => {
                    toast.success("Playlists saved");
                    setSelectedPlaylists(res);
                    setInitialSelection(res);
                  }),
                  Effect.catchAll(() => {
                    toast.error("Failed to save playlists");
                    return Effect.succeed([]);
                  }),
                  Effect.runPromise,
                );
              })
            }
          >
            Save Changes ({selectedPlaylists.length})
          </Button>
        </div>
      </div>
    </div>
  );
}
