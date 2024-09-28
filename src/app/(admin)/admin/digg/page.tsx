"use server";

import { Either } from "effect";
import { PlaylistsProvider } from "~/app/(admin)/admin/digg/context";
import YoutubePlaylists from "~/app/(admin)/admin/digg/item";
import YoutubePlaylistSelection from "~/app/(admin)/admin/digg/selection";
import {
  $getFavoriteYoutubePlaylists,
  $getUserPlaylists,
} from "~/server/digg/youtube/playlist";

export default async function AdminDigPage() {
  const [playlists, favourites] = await Promise.all([
    $getUserPlaylists(),
    $getFavoriteYoutubePlaylists(),
  ]);

  if (Either.isLeft(playlists)) {
    return <div>Error: {playlists.left._tag}</div>;
  }

  return (
    <PlaylistsProvider
      selectedPlaylists={favourites}
      playlists={playlists.right}
    >
      <div className="container mx-auto p-4 pb-20">
        <h1 className="mb-6 text-2xl font-bold">
          Select Your Favorite Playlists
        </h1>
        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          <YoutubePlaylists />
        </div>
        <YoutubePlaylistSelection />
      </div>
    </PlaylistsProvider>
  );
}
