export const PIANO_LOW = 21;
export const PIANO_HIGH = 108;
export const BLACK_KEY_WIDTH = 0.6;
export const BLACK_KEY_HEIGHT = 0.62;

const BLACK_CLASSES = new Set([1, 3, 6, 8, 10]);
const mod12 = (p: number) => ((p % 12) + 12) % 12;

export const isBlackKey = (pitch: number) => BLACK_CLASSES.has(mod12(pitch));

export type KeyRange = { low: number; high: number };

export function fitKeyRange(min: number, max: number, minKeys = 25, margin = 2): KeyRange {
  let low = min - margin;
  let high = max + margin;
  while (high - low + 1 < minKeys) {
    low--;
    high++;
  }
  return {
    low: Math.max(PIANO_LOW, low - mod12(low)),
    high: Math.min(PIANO_HIGH, high + (11 - mod12(high))),
  };
}

export type KeyRect = { pitch: number; x: number; width: number; black: boolean };

export type KeyLayout = KeyRange & {
  width: number;
  whiteWidth: number;
  keys: KeyRect[];
  byPitch: (KeyRect | undefined)[];
};

export function layoutKeys({ low, high }: KeyRange, width: number): KeyLayout {
  let whites = 0;
  for (let p = low; p <= high; p++) if (!isBlackKey(p)) whites++;
  const whiteWidth = width / Math.max(whites, 1);
  const blackWidth = whiteWidth * BLACK_KEY_WIDTH;

  const white: KeyRect[] = [];
  const black: KeyRect[] = [];
  const byPitch: (KeyRect | undefined)[] = [];
  let index = 0;

  for (let p = low; p <= high; p++) {
    const rect = isBlackKey(p)
      ? { pitch: p, x: index * whiteWidth - blackWidth / 2, width: blackWidth, black: true }
      : { pitch: p, x: index++ * whiteWidth, width: whiteWidth, black: false };
    (rect.black ? black : white).push(rect);
    byPitch[p] = rect;
  }

  return { low, high, width, whiteWidth, keys: [...white, ...black], byPitch };
}
