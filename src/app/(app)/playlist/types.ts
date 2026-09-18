import type { playlistSongs } from "@/db/schema";

export type PlaylistSong = typeof playlistSongs.$inferSelect;
