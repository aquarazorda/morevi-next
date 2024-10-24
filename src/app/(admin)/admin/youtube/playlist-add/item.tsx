"use client";

import { Check } from "lucide-react";
import { use } from "react";
import { PlaylistsContext } from "~/app/(admin)/admin/youtube/playlist-add/context";
import { Card, CardContent } from "~/components/ui/card";
import { cn } from "~/lib/utils";

export default function YoutubePlaylists() {
  const { playlists, selectedPlaylists, togglePlaylist } =
    use(PlaylistsContext);

  return playlists.map((playlist) => (
    <Card
      key={playlist.externalId}
      className={cn(
        "cursor-pointer transition-all",
        selectedPlaylists.some((p) => p.id === playlist.externalId)
          ? "ring-2 ring-primary"
          : "",
      )}
      onClick={() => togglePlaylist(playlist.externalId)}
    >
      <CardContent className="p-2">
        <div className="relative">
          <img
            src={playlist.coverUrl}
            alt={playlist.name}
            className="h-auto w-full rounded-md"
          />
          {selectedPlaylists.some((p) => p.id === playlist.externalId) && (
            <div className="absolute right-1 top-1 rounded-full bg-primary p-0.5 text-primary-foreground">
              <Check className="h-3 w-3" />
            </div>
          )}
        </div>
        <h2 className="mt-2 line-clamp-2 text-center text-sm font-semibold">
          {playlist.name}
        </h2>
      </CardContent>
    </Card>
  ));
}
