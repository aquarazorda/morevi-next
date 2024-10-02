"use client";

import { formatDuration, highlightText } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { MoreHorizontal, Play, Pause, Plus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { usePlaylist } from "~/hooks/use-playlist";
import Image from "next/image";
import { type Song } from "~/server/db/types";
import { usePlayback } from "~/app/(digger)/playback-context";
import { useState } from "react";

export function TrackRow({
  track,
  index,
  query,
  isSelected,
  onSelect,
}: {
  track: Song;
  index: number;
  query?: string;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const {
    currentTrack,
    playTrack,
    togglePlayPause,
    isPlaying,
    setActivePanel,
    handleKeyNavigation,
  } = usePlayback();
  const { playlists } = usePlaylist();

  const [isFocused, setIsFocused] = useState(false);
  const isProduction = process.env.NEXT_PUBLIC_VERCEL_ENV === "production";
  const isCurrentTrack = currentTrack?.name === track.name;

  function onClickTrackRow(e: React.MouseEvent) {
    e.preventDefault();
    setActivePanel("tracklist");
    onSelect();
    if (isCurrentTrack) {
      void togglePlayPause();
    } else {
      void playTrack(track);
    }
  }

  function onKeyDownTrackRow(e: React.KeyboardEvent<HTMLTableRowElement>) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect();
      if (isCurrentTrack) {
        void togglePlayPause();
      } else {
        void playTrack(track);
      }
    } else {
      handleKeyNavigation(e, "tracklist");
    }
  }

  return (
    <tr
      className={`group relative cursor-pointer select-none hover:bg-[#1A1A1A] ${
        isCurrentTrack ? "bg-[#1A1A1A]" : ""
      }`}
      tabIndex={0}
      onClick={onClickTrackRow}
      onKeyDown={onKeyDownTrackRow}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
    >
      <td className="w-10 py-[2px] pl-3 pr-2 text-center tabular-nums">
        {isCurrentTrack && isPlaying ? (
          <div className="mx-auto flex size-[0.65rem] items-end justify-center space-x-[2px]">
            <div className="animate-now-playing-1 w-1 bg-neutral-600"></div>
            <div className="animate-now-playing-2 w-1 bg-neutral-600 [animation-delay:0.2s]"></div>
            <div className="animate-now-playing-3 w-1 bg-neutral-600 [animation-delay:0.4s]"></div>
          </div>
        ) : (
          <span className="text-gray-400">{index + 1}</span>
        )}
      </td>
      <td className="px-2 py-[2px]">
        <div className="flex items-center">
          <div className="relative mr-2 size-5">
            <Image
              src={track.imageUrl ?? "/placeholder.svg"}
              alt={`${track.album} cover`}
              fill
              className="object-cover"
            />
          </div>
          <div className="max-w-[180px] truncate font-medium text-[#d1d5db] sm:max-w-[200px]">
            {highlightText(track.name, query)}
            <span className="ml-1 text-gray-400 sm:hidden">
              • {highlightText(track.artist, query)}
            </span>
          </div>
        </div>
      </td>
      <td className="hidden max-w-40 truncate px-2 py-[2px] text-[#d1d5db] sm:table-cell">
        {highlightText(track.artist, query)}
      </td>
      <td className="hidden px-2 py-[2px] text-[#d1d5db] md:table-cell">
        {highlightText(track.album!, query)}
      </td>
      <td className="px-2 py-[2px] tabular-nums text-[#d1d5db]">
        {formatDuration(track.duration)}
      </td>
      <td className="px-2 py-[2px]">
        <div className="opacity-0 transition-opacity group-hover:opacity-100">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                disabled={isProduction}
                variant="ghost"
                size="icon"
                className="h-5 w-5 text-gray-400 hover:text-white focus:text-white"
              >
                <MoreHorizontal className="size-4" />
                <span className="sr-only">Track options</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                className="text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  if (isCurrentTrack) {
                    void togglePlayPause();
                  } else {
                    void playTrack(track);
                  }
                }}
              >
                {isCurrentTrack && isPlaying ? (
                  <>
                    <Pause className="mr-2 size-3 stroke-[1.5]" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="mr-2 size-3 stroke-[1.5]" />
                    Play
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="text-xs">
                  <Plus className="mr-2 size-3" />
                  Add to Playlist
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="w-48">
                  {playlists.map((playlist) => (
                    <DropdownMenuItem
                      className="text-xs"
                      key={playlist.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        // addToPlaylistAction(playlist.id, track.id);
                      }}
                    >
                      {playlist.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </td>
      {(isSelected || isFocused) && (
        <div className="pointer-events-none absolute inset-0 border border-[#1e3a8a]" />
      )}
    </tr>
  );
}
