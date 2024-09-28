"use server";

import { $getUserPlaylists } from "~/server/digg/youtube/playlist";
import { $getPlaylistItems } from "~/server/digg/youtube/playlist-items";

export default async function AdminDigPage() {
  const playlists = await $getUserPlaylists();
  console.log(playlists);
  return (
    <form
      action={async (formData) => {
        "use server";
        const result = await $getPlaylistItems(formData);

        console.log(result);
      }}
    >
      <input type="text" name="youtube-playlist-url" />
      <button type="submit">Digg</button>
    </form>
  );
}
