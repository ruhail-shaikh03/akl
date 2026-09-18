import { z } from "zod";

export const addPlaylistSongSchema = z.object({
  spotifyTrackId: z.string().trim().min(1).max(64),
  titleCache: z.string().trim().max(200).optional(),
  artistCache: z.string().trim().max(200).optional(),
  note: z.string().trim().max(500).optional(),
});
export type AddPlaylistSongInput = z.infer<typeof addPlaylistSongSchema>;

export const updateSongNoteSchema = z.object({
  id: z.string().uuid(),
  note: z.string().trim().max(500).optional(),
});
export type UpdateSongNoteInput = z.infer<typeof updateSongNoteSchema>;

/** Accepts a raw Spotify track ID or a full track URL and returns just the ID. */
export function extractSpotifyTrackId(input: string): string {
  const trimmed = input.trim();
  const match = trimmed.match(/track[/:]([a-zA-Z0-9]+)/);
  return match ? match[1] : trimmed;
}
