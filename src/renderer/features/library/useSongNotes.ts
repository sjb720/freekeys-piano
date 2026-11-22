import { useEffect, useState } from 'react';
import { parseMidi, resolveHand, type HandOverride, type Song } from '@shared/song';

// Parses the song file and applies the saved hand override, so colors match the player.
export function useSongNotes(id: string, hands: HandOverride): Song | null {
  const [song, setSong] = useState<{ key: string; song: Song } | null>(null);
  const handsKey = JSON.stringify(hands);
  const key = `${id}:${handsKey}`;

  useEffect(() => {
    let live = true;
    void window.api.songs
      .load(id)
      .then((file) => {
        if (!live || !file) return;
        const parsed = parseMidi(file.bytes, file.ref.title);
        const override = JSON.parse(handsKey) as HandOverride;
        for (const note of parsed.notes) note.hand = resolveHand(note, override);
        setSong({ key, song: parsed });
      })
      .catch((error: unknown) => console.error('Could not load song notes', error));
    return () => {
      live = false;
    };
  }, [id, handsKey, key]);

  return song?.key === key ? song.song : null;
}
