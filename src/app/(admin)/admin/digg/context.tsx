"use client";

import { createContext, useState } from "react";
import { type PlaylistInfo } from "~/server/digg/youtube/playlist";

export const PlaylistsContext = createContext<{
  selectedPlaylists: string[];
  initialSelection: string[];
  togglePlaylist: (playlistId: string) => void;
  playlists: PlaylistInfo[];
  clearAll: () => void;
}>({
  selectedPlaylists: [],
  initialSelection: [],
  playlists: [],
  clearAll: () => {
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
  selectedPlaylists: string[];
  playlists: PlaylistInfo[];
  children: React.ReactNode;
}) => {
  const [selected, setSelectedPlaylists] =
    useState<string[]>(selectedPlaylists);

  const togglePlaylist = (playlistId: string) => {
    setSelectedPlaylists((prev) =>
      prev.includes(playlistId)
        ? prev.filter((id) => id !== playlistId)
        : [...prev, playlistId],
    );
  };

  return (
    <PlaylistsContext.Provider
      value={{
        selectedPlaylists: selected,
        initialSelection: selectedPlaylists,
        togglePlaylist,
        playlists,
        clearAll: () => setSelectedPlaylists(selectedPlaylists),
      }}
    >
      {children}
    </PlaylistsContext.Provider>
  );
};
