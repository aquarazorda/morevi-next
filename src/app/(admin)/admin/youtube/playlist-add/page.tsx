import { Effect } from "effect";
import { PlaylistsProvider } from "~/app/(admin)/admin/youtube/playlist-add/context";
import YoutubePlaylists from "~/app/(admin)/admin/youtube/playlist-add/item";
import YoutubePlaylistSelection from "~/app/(admin)/admin/youtube/playlist-add/selection";
import { Badge } from "~/components/ui/badge";
import {
  $getFavoriteYoutubePlaylists,
  $getUserPlaylists,
} from "~/server/digg/youtube/exports";
import effectComponent from "~/server/effect";

export default effectComponent(() =>
  Effect.gen(function* () {
    const [playlists, favourites] = yield* Effect.all([
      $getUserPlaylists,
      $getFavoriteYoutubePlaylists(),
    ]);

    const selectedPlaylists = favourites.map((f) => ({
      id: f.playlistId,
      name: f.name,
    }));

    return (
      <PlaylistsProvider
        selectedPlaylists={selectedPlaylists}
        playlists={playlists}
      >
        <div className="container mx-auto p-4 pb-20">
          <h1 className="mb-6 flex items-center justify-between text-2xl font-bold">
            Select Your Favorite Playlists
            <div className="flex gap-2">
              {!!selectedPlaylists.length &&
                selectedPlaylists.map(({ name, id }) => (
                  <Badge key={id}>{name}</Badge>
                ))}
            </div>
          </h1>
          <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            <YoutubePlaylists />
          </div>
          <YoutubePlaylistSelection />
        </div>
      </PlaylistsProvider>
    );
  }),
);
