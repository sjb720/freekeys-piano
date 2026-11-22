import { BitmapFont } from 'pixi.js';
import type { KeyLabelMode } from '@shared/settings';
import { noteName, pitchClassName } from '@shared/song';
import { TINT_NONE } from '@renderer/themes';

export const LABEL_FONT_FAMILY = 'system-ui, sans-serif';
export const NOTE_LABEL_FONT = 'note-labels';

export const labelFor = (pitch: number, black: boolean, mode: KeyLabelMode): string | null => {
  const isC = pitch % 12 === 0;
  if (mode === 'off' || (mode === 'c' && !isC) || (mode === 'white' && black)) return null;
  return isC ? noteName(pitch) : pitchClassName(pitch);
};

export const noteLetter = (pitch: number): string => pitchClassName(pitch);

let installed = false;

export function installNoteLabelFont(): void {
  if (installed) return;
  installed = true;
  BitmapFont.install({
    name: NOTE_LABEL_FONT,
    style: { fontFamily: LABEL_FONT_FAMILY, fontSize: 48, fontWeight: '700', fill: TINT_NONE },
    chars: [['A', 'G'], '#', ['0', '9']],
    resolution: 2,
  });
}
