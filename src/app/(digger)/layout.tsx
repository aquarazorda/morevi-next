import { PlaybackProvider } from "./playback-context";
import { PlaylistProvider } from "~/hooks/use-playlist";
import { type Playlist } from "~/server/db/types";
import { OptimisticPlaylists } from "~/app/(digger)/optimistic-playlists";
import { NowPlaying } from "~/app/(digger)/now-playing";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const playlistsPromise = async () => [] as Playlist[];

  return (
    <PlaybackProvider>
      <PlaylistProvider playlistsPromise={playlistsPromise()}>
        <OptimisticPlaylists />
        {children}
      </PlaylistProvider>
      <NowPlaying />
    </PlaybackProvider>
  );
}
