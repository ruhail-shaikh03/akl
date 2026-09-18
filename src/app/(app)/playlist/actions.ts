"use server";

import { revalidatePath } from "next/cache";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { playlistSongs } from "@/db/schema";
import { requireSession } from "@/lib/auth/guards";
import { checkMutationLimit } from "@/lib/ratelimit/limiters";
import {
  addPlaylistSongSchema,
  extractSpotifyTrackId,
  updateSongNoteSchema,
} from "@/lib/validations/playlist.schema";

class RateLimitedError extends Error {
  constructor() {
    super("Too many requests. Try again in a bit.");
  }
}

async function assertMutationAllowed(userId: string) {
  const { success } = await checkMutationLimit(userId);
  if (!success) throw new RateLimitedError();
}

export async function getPlaylistSongs() {
  await requireSession();
  return db.select().from(playlistSongs).orderBy(asc(playlistSongs.sortOrder), asc(playlistSongs.createdAt));
}

export async function addPlaylistSong(input: unknown) {
  const session = await requireSession();
  await assertMutationAllowed(session.sub);
  const data = addPlaylistSongSchema.parse(input);
  const trackId = extractSpotifyTrackId(data.spotifyTrackId);

  await db
    .insert(playlistSongs)
    .values({
      spotifyTrackId: trackId,
      titleCache: data.titleCache,
      artistCache: data.artistCache,
      note: data.note,
      addedBy: session.sub,
    })
    .onConflictDoUpdate({
      target: playlistSongs.spotifyTrackId,
      set: {
        titleCache: data.titleCache,
        artistCache: data.artistCache,
        note: data.note,
      },
    });

  revalidatePath("/playlist");
}

export async function updateSongNote(input: unknown) {
  const session = await requireSession();
  await assertMutationAllowed(session.sub);
  const { id, note } = updateSongNoteSchema.parse(input);
  await db.update(playlistSongs).set({ note }).where(eq(playlistSongs.id, id));
  revalidatePath("/playlist");
}

export async function removeSong(id: string) {
  const session = await requireSession();
  await assertMutationAllowed(session.sub);
  await db.delete(playlistSongs).where(eq(playlistSongs.id, id));
  revalidatePath("/playlist");
}
