"use client";

import { usePlayback } from "./playback-context";
import { PlaybackControls } from "./playback-controls";

export function NowPlaying() {
  const { currentTrack } = usePlayback();

  return (
    <>
      <div className="hidden w-56 overflow-auto bg-[#121212] p-4 md:block">
        {currentTrack ? (
          <>
            <h2 className="mb-3 text-sm font-semibold text-gray-200">
              Now Playing
            </h2>
            <img
              src={currentTrack.imageUrl ?? undefined}
              alt="Current track"
              className="mb-3 aspect-square w-full object-cover"
            />
            <div className="space-y-1 text-xs">
              <div>
                <p className="text-gray-400">Title</p>
                <p className="truncate text-gray-200">{currentTrack.name}</p>
              </div>
              <div>
                <p className="text-gray-400">Artist</p>
                <p className="truncate text-gray-200">{currentTrack.artist}</p>
              </div>
              <div>
                <p className="text-gray-400">Album</p>
                <p className="truncate text-gray-200">{currentTrack.album}</p>
              </div>
              <div>
                <p className="text-gray-400">Genre</p>
                <p className="truncate text-gray-200">{currentTrack.genre}</p>
              </div>
              <div>
                <p className="text-gray-400">BPM</p>
                <p className="tabular-nums text-gray-200">{currentTrack.bpm}</p>
              </div>
              <div>
                <p className="text-gray-400">Key</p>
                <p className="text-gray-200">{currentTrack.key}</p>
              </div>
            </div>
          </>
        ) : null}
      </div>
      <PlaybackControls />
    </>
  );
}
