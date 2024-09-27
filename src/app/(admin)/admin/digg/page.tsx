"use server";

import { $getPlaylistItems } from "~/server/digg/youtube/playlist-items";

export default async function AdminDigPage() {
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
