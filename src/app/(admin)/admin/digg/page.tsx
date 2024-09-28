"use server";

import { Either } from "effect";
import { $getUserPlaylists } from "~/server/digg/youtube/playlist";
import { $getPlaylistItems } from "~/server/digg/youtube/playlist-items";

export default async function AdminDigPage() {
  const playlists = await $getUserPlaylists();

  if (Either.isLeft(playlists)) {
    return <div>Error: {playlists.left._tag}</div>;
  }

  return (
    <form
      action={async (formData) => {
        "use server";
        const result = await $getPlaylistItems(formData);

        console.log(result);
      }}
    >
      <ul>
        {playlists.right.map((playlist) => (
          <li key={playlist.id}>{playlist.title}</li>
        ))}
      </ul>
    </form>
  );
}
