import { Container, NineSliceSprite, Sprite, Texture } from 'pixi.js';
import { forEachNoteInWindow, type Song } from '@shared/song';
import type { PixiPalette } from '@renderer/themes';
import type { KeyLayout } from './keyLayout';

export type Area = { x: number; y: number; width: number; height: number };

const NOTE_INSET = 2;
const MIN_NOTE_HEIGHT = 6;
const CORNER = 6;

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
  private readonly lanes: Pool<Sprite>;
  private readonly lines: Pool<Sprite>;
  private readonly notes: Pool<NineSliceSprite>;

  constructor(noteTexture: Texture) {
    super();
    this.addChild(this.background, this.laneLayer, this.lineLayer, this.noteLayer);
    const line = () => new Sprite(Texture.WHITE);
    this.lanes = new Pool(this.laneLayer, line);
    this.lines = new Pool(this.lineLayer, line);
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

  render(
    song: Song,
    position: number,
    fallTime: number,
    keys: KeyLayout,
    area: Area,
    palette: PixiPalette,
  ): void {
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
      sprite.tint = color;
      sprite.alpha = alpha;
    });
    this.notes.release();
  }
}
