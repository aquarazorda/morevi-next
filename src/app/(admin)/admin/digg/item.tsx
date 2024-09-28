"use client";

import { Check } from "lucide-react";
import { use } from "react";
import { PlaylistsContext } from "~/app/(admin)/admin/digg/context";
import { Card, CardContent } from "~/components/ui/card";

export default function YoutubePlaylists() {
  const { playlists, selectedPlaylists, togglePlaylist } =
    use(PlaylistsContext);

  return playlists.map((playlist) => (
    <Card
      key={playlist.id}
      className={`cursor-pointer transition-all ${
        selectedPlaylists.includes(playlist.id) ? "ring-2 ring-primary" : ""
      }`}
      onClick={() => togglePlaylist(playlist.id)}
    >
      <CardContent className="p-2">
        <div className="relative">
          <img
            src={playlist.thumbnailUrl}
            alt={playlist.title}
            className="h-auto w-full rounded-md"
          />
          {selectedPlaylists.includes(playlist.id) && (
            <div className="absolute right-1 top-1 rounded-full bg-primary p-0.5 text-primary-foreground">
              <Check className="h-3 w-3" />
            </div>
          )}
        </div>
        <h2 className="mt-2 line-clamp-2 text-center text-sm font-semibold">
          {playlist.title}
        </h2>
      </CardContent>
    </Card>
  ));
}