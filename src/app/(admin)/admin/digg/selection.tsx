"use client";

import { X } from "lucide-react";
import { use, useMemo } from "react";
import { PlaylistsContext } from "~/app/(admin)/admin/digg/context";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { ScrollArea } from "~/components/ui/scroll-area";

const Item = ({ id }: { id: string }) => {
  const { playlists, initialSelection, togglePlaylist, selectedPlaylists } =
    use(PlaylistsContext);

  const playlist = useMemo(
    () => playlists.find((p) => p.id === id),
    [id, playlists],
  );

  const { isRemoved, isAdded } = useMemo(() => {
    const initialSet = new Set(initialSelection);
    const currentSet = new Set(selectedPlaylists);

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
      {playlist?.title}
      <button className="ml-1 group-hover:text-destructive">
        <X className="h-3 w-3" />
      </button>
    </Badge>
  );
};

export default function YoutubePlaylistSelection() {
  const { selectedPlaylists, initialSelection, clearAll } =
    use(PlaylistsContext);

  const hasChanges =
    selectedPlaylists.length !== initialSelection.length ||
    selectedPlaylists.some((id) => !initialSelection.includes(id));

  if (!hasChanges) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 border-t bg-background p-4 shadow-lg">
      <div className="container mx-auto flex flex-wrap items-center justify-between gap-2">
        <ScrollArea className="h-fit flex-1">
          <div className="flex flex-wrap gap-2">
            {selectedPlaylists.map((id) => (
              <Item key={id} id={id} />
            ))}
          </div>
        </ScrollArea>
        <Button variant="destructive" onClick={clearAll}>
          Clear Changes
          <X className="h-3 w-3" />
        </Button>
        <Button onClick={() => console.log(selectedPlaylists)}>
          Save Changes ({selectedPlaylists.length})
        </Button>
      </div>
    </div>
  );
}
