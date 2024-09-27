"use server";

import { getPlaylistItemsFormData } from "~/server/digg/youtube";

export default async function AdminDigPage() {
  return (
    <form
      action={async (formData) => {
        "use server";
        const result = await getPlaylistItemsFormData(formData);

        console.log(result);
      }}
    >
      <input type="text" name="youtube-playlist-url" />
      <button type="submit">Digg</button>
    </form>
  );
}
