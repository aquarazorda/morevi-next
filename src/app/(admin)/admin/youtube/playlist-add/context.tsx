"use client";

import { createContext, useState } from "react";
import { type YoutubePlaylistInfo } from "~/server/digg/youtube/playlist";

export const PlaylistsContext = createContext<{
  selectedPlaylists: { id: string; name: string }[];
  initialSelection: { id: string; name: string }[];
  playlists: YoutubePlaylistInfo[];
  togglePlaylist: (playlistId: string) => void;
  clearAll: () => void;
  setSelectedPlaylists: (playlists: { id: string; name: string }[]) => void;
  setInitialSelection: (playlists: { id: string; name: string }[]) => void;
}>({
  selectedPlaylists: [],
  initialSelection: [],
  playlists: [],
  setSelectedPlaylists: () => {
    return;
  },
  clearAll: () => {
    return;
  },
  setInitialSelection: () => {
    return;
  },
  togglePlaylist: () => {
    return;
  },
});

export const PlaylistsProvider = ({
  selectedPlaylists,
  playlists,
  children,
}: {
  selectedPlaylists: { id: string; name: string }[];
  playlists: YoutubePlaylistInfo[];
  children: React.ReactNode;
}) => {
  const [selected, setSelectedPlaylists] =
    useState<{ id: string; name: string }[]>(selectedPlaylists);
  const [initialSelection, setInitialSelection] =
    useState<{ id: string; name: string }[]>(selectedPlaylists);

  const togglePlaylist = (playlistId: string) => {
    setSelectedPlaylists((prev) =>
      prev.some((p) => p.id === playlistId)
        ? prev.filter((p) => p.id !== playlistId)
        : [
            ...prev,
            {
              id: playlistId,
              name:
                playlists.find((p) => p.externalId === playlistId)?.name ?? "",
            },
          ],
    );
  };

  return (
    <PlaylistsContext.Provider
      value={{
        selectedPlaylists: selected,
        initialSelection: initialSelection,
        togglePlaylist,
        playlists,
        setSelectedPlaylists,
        setInitialSelection,
        clearAll: () => setSelectedPlaylists(initialSelection),
      }}
    >
      {children}
    </PlaylistsContext.Provider>
  );
};
