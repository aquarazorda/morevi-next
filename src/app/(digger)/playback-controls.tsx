"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "~/components/ui/button";
import {
  Heart,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from "lucide-react";
import { usePlayback } from "./playback-context";

export function TrackInfo() {
  const { currentTrack } = usePlayback();

  return (
    <div className="flex w-1/3 items-center space-x-3">
      {currentTrack && (
        <>
          <img
            src={currentTrack.imageUrl ?? "/placeholder.svg"}
            alt="Now playing"
            className="h-10 w-10 object-cover"
          />
          <div className="min-w-0 flex-shrink">
            <div className="max-w-[120px] truncate text-sm font-medium text-gray-200 sm:max-w-[200px]">
              {currentTrack.name}
            </div>
            <div className="max-w-[120px] truncate text-xs text-gray-400 sm:max-w-[200px]">
              {currentTrack.artist}
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="hidden h-8 w-8 flex-shrink-0 sm:flex"
          >
            <Heart className="h-4 w-4" />
          </Button>
        </>
      )}
    </div>
  );
}

export function PlaybackButtons() {
  const {
    isPlaying,
    togglePlayPause,
    playPreviousTrack,
    playNextTrack,
    currentTrack,
  } = usePlayback();

  return (
    <div className="flex items-center space-x-2">
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={playPreviousTrack}
        disabled={!currentTrack}
      >
        <SkipBack className="h-4 w-4 stroke-[1.5]" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={togglePlayPause}
        disabled={!currentTrack}
      >
        {isPlaying ? (
          <Pause className="h-5 w-5 stroke-[1.5]" />
        ) : (
          <Play className="h-5 w-5 stroke-[1.5]" />
        )}
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={playNextTrack}
        disabled={!currentTrack}
      >
        <SkipForward className="h-4 w-4 stroke-[1.5]" />
      </Button>
    </div>
  );
}

export function ProgressBar() {
  const { currentTime, duration, audioRef, setCurrentTime } = usePlayback();
  const progressBarRef = useRef<HTMLDivElement>(null);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleProgressChange = (e: React.MouseEvent<HTMLDivElement>) => {
    if (progressBarRef.current && audioRef.current) {
      const rect = progressBarRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
      const newTime = (percentage / 100) * duration;
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  return (
    <div className="mt-1 flex w-full items-center">
      <span className="text-xs tabular-nums text-gray-400">
        {formatTime(currentTime)}
      </span>
      <div
        ref={progressBarRef}
        className="relative mx-2 h-1 flex-grow cursor-pointer rounded-full bg-[#3E3E3E]"
        onClick={handleProgressChange}
      >
        <div
          className="absolute left-0 top-0 h-full rounded-full bg-white"
          style={{
            width: `${(currentTime / duration) * 100}%`,
          }}
        ></div>
      </div>
      <span className="text-xs tabular-nums text-gray-400">
        {formatTime(duration)}
      </span>
    </div>
  );
}

export function Volume() {
  const { audioRef, currentTrack } = usePlayback();
  const [volume, setVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const [isVolumeVisible, setIsVolumeVisible] = useState(false);
  const volumeBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume / 100;
    }
  }, [volume, isMuted, audioRef]);

  const handleVolumeChange = (e: React.MouseEvent<HTMLDivElement>) => {
    if (volumeBarRef.current) {
      const rect = volumeBarRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
      setVolume(percentage);
      if (audioRef.current) {
        audioRef.current.volume = percentage / 100;
      }
      setIsMuted(percentage === 0);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = volume / 100;
        setIsMuted(false);
      } else {
        audioRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  };

  const toggleVolumeVisibility = () => {
    setIsVolumeVisible(!isVolumeVisible);
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => {
          toggleMute();
          toggleVolumeVisibility();
        }}
        disabled={!currentTrack}
      >
        {isMuted ? (
          <VolumeX className="h-4 w-4 text-gray-400" />
        ) : (
          <Volume2 className="h-4 w-4 text-gray-400" />
        )}
      </Button>
      {isVolumeVisible && (
        <div className="absolute bottom-full right-0 mb-2 rounded-md bg-[#282828] p-2 shadow-lg">
          <div
            ref={volumeBarRef}
            className="relative h-1 w-20 cursor-pointer rounded-full bg-[#3E3E3E]"
            onClick={handleVolumeChange}
          >
            <div
              className="absolute left-0 top-0 h-full rounded-full bg-white"
              style={{ width: `${volume}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
}

export function PlaybackControls() {
  const {
    currentTrack,
    audioRef,
    setCurrentTime,
    setDuration,
    playPreviousTrack,
    playNextTrack,
    togglePlayPause,
  } = usePlayback();

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      const updateTime = () => setCurrentTime(audio.currentTime);
      const updateDuration = () => setDuration(audio.duration);

      audio.addEventListener("timeupdate", updateTime);
      audio.addEventListener("loadedmetadata", updateDuration);

      return () => {
        audio.removeEventListener("timeupdate", updateTime);
        audio.removeEventListener("loadedmetadata", updateDuration);
      };
    }
  }, [audioRef, setCurrentTime, setDuration]);

  useEffect(() => {
    if ("mediaSession" in navigator && currentTrack) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentTrack.name,
        artist: currentTrack.artist,
        album: currentTrack.album ?? undefined,
        artwork: [
          { src: currentTrack.imageUrl!, sizes: "512x512", type: "image/jpeg" },
        ],
      });

      navigator.mediaSession.setActionHandler("play", () => {
        void audioRef.current?.play();
        void togglePlayPause();
      });

      navigator.mediaSession.setActionHandler("pause", () => {
        void audioRef.current?.pause();
        void togglePlayPause();
      });

      navigator.mediaSession.setActionHandler("previoustrack", () => {
        void playPreviousTrack();
      });
      navigator.mediaSession.setActionHandler("nexttrack", () => {
        void playNextTrack();
      });

      navigator.mediaSession.setActionHandler("seekto", (details) => {
        if (audioRef.current && details.seekTime !== undefined) {
          audioRef.current.currentTime = details.seekTime;
          setCurrentTime(details.seekTime);
        }
      });

      const updatePositionState = () => {
        if (audioRef.current && !isNaN(audioRef.current.duration)) {
          try {
            navigator.mediaSession.setPositionState({
              duration: audioRef.current.duration,
              playbackRate: audioRef.current.playbackRate,
              position: audioRef.current.currentTime,
            });
          } catch (error) {
            console.error("Error updating position state:", error);
          }
        }
      };

      const handleLoadedMetadata = () => {
        updatePositionState();
      };

      audioRef.current?.addEventListener("timeupdate", updatePositionState);
      audioRef.current?.addEventListener(
        "loadedmetadata",
        handleLoadedMetadata,
      );

      return () => {
        audioRef.current?.removeEventListener(
          "timeupdate",
          updatePositionState,
        );
        audioRef.current?.removeEventListener(
          "loadedmetadata",
          handleLoadedMetadata,
        );
        navigator.mediaSession.setActionHandler("play", null);
        navigator.mediaSession.setActionHandler("pause", null);
        navigator.mediaSession.setActionHandler("previoustrack", null);
        navigator.mediaSession.setActionHandler("nexttrack", null);
        navigator.mediaSession.setActionHandler("seekto", null);
      };
    }
  }, [
    currentTrack,
    playPreviousTrack,
    playNextTrack,
    togglePlayPause,
    audioRef,
    setCurrentTime,
  ]);

  return (
    <div className="fixed bottom-0 left-0 right-0 flex items-center justify-between border-t border-[#282828] bg-[#181818] p-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
      <audio ref={audioRef} />
      <TrackInfo />
      <div className="flex w-1/3 flex-col items-center">
        <PlaybackButtons />
        <ProgressBar />
      </div>
      <div className="flex w-1/3 items-center justify-end space-x-2">
        <Volume />
      </div>
    </div>
  );
}
