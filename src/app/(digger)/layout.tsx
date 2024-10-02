import { PlaybackProvider } from "./playback-context";
import { PlaylistProvider } from "~/hooks/use-playlist";
import { type Playlist } from "~/server/db/types";
import { OptimisticPlaylists } from "~/app/(digger)/optimistic-playlists";
import { NowPlaying } from "~/app/(digger)/now-playing";
import { getUserYoutubePlaylists } from "~/server/digg/youtube/playlist";
import { Effect, Either } from "effect";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const playlistsPromise = async () => [] as Playlist[];
  const youtubePlaylists = getUserYoutubePlaylists.pipe(
    Effect.either,
    Effect.map(Either.getOrUndefined),
    Effect.runPromise,
  );

  return (
    <PlaybackProvider>
      <PlaylistProvider
        playlistsPromise={playlistsPromise()}
        youtubePlaylistsPromise={youtubePlaylists}
      >
        <OptimisticPlaylists />
        {children}
      </PlaylistProvider>
      <NowPlaying />
    </PlaybackProvider>
  );
}
