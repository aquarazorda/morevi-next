import {
  type playlists,
  type playlistSongs,
  type songs,
} from "~/server/db/schema/track";

export type Song = typeof songs.$inferSelect;
export type NewSong = typeof songs.$inferInsert;
export type Playlist = typeof playlists.$inferSelect;
export type NewPlaylist = typeof playlists.$inferInsert;
export type PlaylistSong = typeof playlistSongs.$inferSelect;
export type NewPlaylistSong = typeof playlistSongs.$inferInsert;
export type PlaylistWithSongs = Playlist & {
  songs: (Song & { order: number })[];
  trackCount: number;
  duration: number;
};
