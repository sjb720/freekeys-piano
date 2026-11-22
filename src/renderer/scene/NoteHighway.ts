import { BitmapText, Container, NineSliceSprite, Sprite, Texture } from 'pixi.js';
import { forEachNoteInWindow, type Note, type Song } from '@shared/song';
import type { PixiPalette } from '@renderer/themes';
import type { KeyLayout } from './keyLayout';
import { installNoteLabelFont, NOTE_LABEL_FONT, noteLetter } from './labels';

export type Area = { x: number; y: number; width: number; height: number };

const NOTE_INSET = 2;
const MIN_NOTE_HEIGHT = 6;
const CORNER = 6;
const MARKER = 3;
const INACTIVE_ALPHA = 0.3;
const LABEL_MAX = 14;
const LABEL_MIN = 8;
const LABEL_PAD = 3;

export type HighwayFrame = {
  song: Song;
  position: number;
  fallTime: number;
  keys: KeyLayout;
  area: Area;
  palette: PixiPalette;
  markers: readonly number[];
  isActive: (note: Note) => boolean;
  labels: boolean;
};

export const noteLabelSize = (text: string, width: number, height: number): number | null => {
  const size = Math.min(LABEL_MAX, width / (0.62 * text.length + 0.3));
  return size >= LABEL_MIN && height >= size + LABEL_PAD * 2 ? size : null;
};

class Pool<T extends Container> {
  private items: T[] = [];
  private used = 0;

  constructor(
    private readonly parent: Container,
    private readonly create: () => T,
  ) {}

  next(): T {
    let item = this.items[this.used];
    if (!item) {
      item = this.create();
      this.items.push(item);
      this.parent.addChild(item);
    }
    item.visible = true;
    this.used++;
    return item;
  }

  release(): void {
    for (let i = this.used; i < this.items.length; i++) this.items[i]!.visible = false;
    this.used = 0;
  }
}

export class NoteHighway extends Container {
  private readonly background = new Sprite(Texture.WHITE);
  private readonly laneLayer = new Container();
  private readonly lineLayer = new Container();
  private readonly noteLayer = new Container();
  private readonly markerLayer = new Container();
  private readonly labelLayer = new Container();
  private readonly labels: Pool<BitmapText>;
  private readonly lanes: Pool<Sprite>;
  private readonly lines: Pool<Sprite>;
  private readonly markers: Pool<Sprite>;
  private readonly notes: Pool<NineSliceSprite>;

  constructor(noteTexture: Texture) {
    super();
    this.addChild(
      this.background,
      this.laneLayer,
      this.lineLayer,
      this.noteLayer,
      this.labelLayer,
      this.markerLayer,
    );
    installNoteLabelFont();
    this.labels = new Pool(this.labelLayer, () => {
      const text = new BitmapText({ text: '', style: { fontFamily: NOTE_LABEL_FONT } });
      text.anchor.set(0.5, 1);
      return text;
    });
    const line = () => new Sprite(Texture.WHITE);
    this.lanes = new Pool(this.laneLayer, line);
    this.lines = new Pool(this.lineLayer, line);
    this.markers = new Pool(this.markerLayer, line);
    this.notes = new Pool(
      this.noteLayer,
      () =>
        new NineSliceSprite({
          texture: noteTexture,
          leftWidth: CORNER,
          rightWidth: CORNER,
          topHeight: CORNER,
          bottomHeight: CORNER,
        }),
    );
  }

  layout(keys: KeyLayout, area: Area, palette: PixiPalette): void {
    Object.assign(this.background, area);
    this.background.tint = palette.highwayBg.color;
    this.background.alpha = palette.highwayBg.alpha;

    const grid = palette.highwayGrid;
    for (const key of keys.keys) {
      if (key.pitch % 12 !== 0 || key.pitch === keys.low) continue;
      const lane = this.lanes.next();
      Object.assign(lane, { x: area.x + key.x, y: area.y, width: 1, height: area.height });
      lane.tint = grid.color;
      lane.alpha = grid.alpha;
    }
    this.lanes.release();
  }

  render({
    song,
    position,
    fallTime,
    keys,
    area,
    palette,
    markers,
    isActive,
    labels,
  }: HighwayFrame): void {
    const bottom = area.y + area.height;
    const pxPerSecond = area.height / fallTime;
    const end = position + fallTime;

    for (const time of song.measures) {
      if (time < position) continue;
      if (time > end) break;
      const line = this.lines.next();
      Object.assign(line, {
        x: area.x,
        y: bottom - (time - position) * pxPerSecond,
        width: area.width,
        height: 1,
      });
      line.tint = palette.highwayGrid.color;
      line.alpha = palette.highwayGrid.alpha;
    }
    this.lines.release();

    forEachNoteInWindow(song, position, end, (note) => {
      const key = keys.byPitch[note.pitch];
      if (!key) return;
      const top = Math.max(area.y, bottom - (note.start + note.duration - position) * pxPerSecond);
      const base = Math.min(bottom, bottom - (note.start - position) * pxPerSecond);
      const sprite = this.notes.next();
      sprite.x = area.x + key.x + NOTE_INSET;
      sprite.y = top;
      sprite.width = Math.max(key.width - NOTE_INSET * 2, CORNER * 2);
      sprite.height = Math.max(base - top, MIN_NOTE_HEIGHT);
      const { color, alpha } = palette[note.hand === 'left' ? 'handLeft' : 'handRight'];
      const dim = isActive(note) ? 1 : INACTIVE_ALPHA;
      sprite.tint = color;
      sprite.alpha = alpha * dim;
      if (labels) this.drawLabel(note.pitch, sprite, palette, dim);
    });
    this.notes.release();
    this.labels.release();

    for (const time of markers) {
      if (time < position || time > end) continue;
      const marker = this.markers.next();
      Object.assign(marker, {
        x: area.x,
        y: bottom - (time - position) * pxPerSecond - MARKER / 2,
        width: area.width,
        height: MARKER,
      });
      marker.tint = palette.loopMarker.color;
      marker.alpha = palette.loopMarker.alpha;
    }
    this.markers.release();
  }

  private drawLabel(pitch: number, note: NineSliceSprite, palette: PixiPalette, dim: number): void {
    const text = noteLetter(pitch);
    const size = noteLabelSize(text, note.width, note.height);
    if (size === null) return;
    const label = this.labels.next();
    label.text = text;
    label.style.fontSize = size;
    label.x = note.x + note.width / 2;
    label.y = note.y + note.height - LABEL_PAD;
    label.tint = palette.noteLabel.color;
    label.alpha = palette.noteLabel.alpha * dim;
  }
}
