"use client";

import { useRef, useEffect, useState, type RefObject } from "react";
import { usePlayback } from "~/app/(digger)/playback-context";

export function TrackTable({
  // playlist,
  query,
  children,
}: {
  // playlist: PlaylistWithSongs;
  query?: string;
  children: React.ReactNode;
}) {
  const tableRef = useRef<HTMLElement>(null);
  const { registerPanelRef, setActivePanel, setPlaylist } = usePlayback();
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);

  useEffect(() => {
    if (tableRef.current) {
      registerPanelRef("tracklist", tableRef as RefObject<HTMLElement>);
    }
  }, [registerPanelRef]);

  // useEffect(() => {
  //   setPlaylist(playlist.songs);
  // }, [playlist.songs, setPlaylist]);

  return (
    <table
      // @ts-expect-error
      ref={tableRef}
      className="w-full text-xs"
      onClick={() => setActivePanel("tracklist")}
    >
      <thead className="sticky top-0 z-10 border-b border-[#282828] bg-[#0A0A0A]">
        <tr className="text-left text-gray-400">
          <th className="w-10 py-2 pl-3 pr-2 font-medium">#</th>
          <th className="px-2 py-2 font-medium">Title</th>
          <th className="hidden px-2 py-2 font-medium sm:table-cell">Artist</th>
          <th className="hidden px-2 py-2 font-medium md:table-cell">Album</th>
          <th className="px-2 py-2 font-medium">Duration</th>
          <th className="w-8 px-2 py-2 font-medium"></th>
        </tr>
      </thead>
      <tbody className="mt-[1px]">{children}</tbody>
    </table>
  );
}
