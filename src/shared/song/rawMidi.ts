const u16 = (b: Uint8Array, at: number) => ((b[at] ?? 0) << 8) | (b[at + 1] ?? 0);
const u32 = (b: Uint8Array, at: number) => ((u16(b, at) << 16) | u16(b, at + 2)) >>> 0;
const tag = (b: Uint8Array, at: number) => String.fromCharCode(...b.subarray(at, at + 4));

export const midiFormat = (bytes: Uint8Array) => u16(bytes, 8);
export const midiTrackCount = (bytes: Uint8Array) => u16(bytes, 10);

// Reads the raw first track chunk: @tonejs/midi moves meta events and notes into separate tracks.
export function firstTrackHasNotes(bytes: Uint8Array): boolean {
  let at = 8 + u32(bytes, 4);
  while (at + 8 <= bytes.length && tag(bytes, at) !== 'MTrk') at += 8 + u32(bytes, at + 4);
  if (at + 8 > bytes.length) return false;
  const end = Math.min(bytes.length, at + 8 + u32(bytes, at + 4));
  let i = at + 8;
  let running = 0;
  const vlq = () => {
    let value = 0;
    for (let k = 0; k < 4 && i < end; k++) {
      const b = bytes[i++]!;
      value = (value << 7) | (b & 0x7f);
      if (!(b & 0x80)) break;
    }
    return value;
  };
  while (i < end) {
    vlq();
    let status = bytes[i]!;
    if (status >= 0x80) i++;
    else status = running;
    if (status === 0xff) i++;
    if (status === 0xff || status === 0xf0 || status === 0xf7) {
      const length = vlq();
      i += length;
    } else if (status >= 0x80) {
      running = status;
      const kind = status & 0xf0;
      if (kind === 0x90 && (bytes[i + 1] ?? 0) > 0) return true;
      i += kind === 0xc0 || kind === 0xd0 ? 1 : 2;
    } else {
      return false;
    }
  }
  return false;
}
