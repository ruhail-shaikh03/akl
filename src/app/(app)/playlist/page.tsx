import { Music } from "lucide-react";
import { getPlaylistSongs } from "./actions";
import { AddSongSheet } from "./AddSongSheet";
import { SongNoteRow } from "./SongNoteRow";

export default async function PlaylistPage() {
  const playlistId = process.env.NEXT_PUBLIC_SPOTIFY_PLAYLIST_ID;
  const songs = await getPlaylistSongs();

  return (
    <main className="mx-auto flex max-w-md flex-col gap-4 px-4 pb-8 pt-safe pt-6">
      <h1 className="font-heading text-2xl">Our Playlist</h1>

      {playlistId ? (
        <iframe
          title="Our Playlist"
          style={{ borderRadius: 12 }}
          src={`https://open.spotify.com/embed/playlist/${playlistId}?utm_source=generator`}
          width="100%"
          height="352"
          frameBorder="0"
          allowFullScreen
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
        />
      ) : (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border p-6 text-center">
          <Music className="size-8 text-muted-foreground" aria-hidden="true" />
          <p className="text-sm text-muted-foreground">No playlist linked yet.</p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-muted-foreground">Song notes</h2>
        <AddSongSheet />
      </div>

      {songs.length === 0 ? (
        <p className="text-sm text-muted-foreground">No notes yet — add one for a song that means something.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {songs.map((song) => (
            <SongNoteRow key={song.id} song={song} />
          ))}
        </ul>
      )}
    </main>
  );
}
