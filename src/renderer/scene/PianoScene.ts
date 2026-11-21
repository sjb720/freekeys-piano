import 'pixi.js/unsafe-eval';
import {
  Graphics,
  Rectangle,
  Sprite,
  Texture,
  type Application,
  type FederatedPointerEvent,
} from 'pixi.js';
import { forEachNoteInWindow, type Song } from '@shared/song';
import { TINT_NONE, type ColorToken, type PixiPalette } from '@renderer/themes';
import { fitKeyRange, layoutKeys, type KeyLayout } from './keyLayout';
import { NoteHighway, type Area } from './NoteHighway';
import { PianoKeyboard } from './PianoKeyboard';

export type ScrubHandlers = {
  onScrubStart(): void;
  onScrub(time: number): void;
  onScrubEnd(): void;
};

export type KeyState = 'pressed' | 'correct' | 'wrong';

export type PianoSceneOptions = {
  song: Song;
  position: () => number;
  keyStates: () => ReadonlyMap<number, KeyState>;
  markers: () => readonly number[];
  onKey: (pitch: number, down: boolean) => void;
  palette: PixiPalette;
  fallTime: number;
  scrub: ScrubHandlers;
};

const KEY_STATE_TOKEN: Record<KeyState, ColorToken> = {
  pressed: 'keyPressed',
  correct: 'keyCorrect',
  wrong: 'keyWrong',
};

const HIT_LINE = 3;

export class PianoScene {
  private readonly noteTexture: Texture;
  private readonly highway: NoteHighway;
  private readonly keyboard: PianoKeyboard;
  private readonly hitLine = new Sprite(Texture.WHITE);
  private readonly active = new Map<number, ColorToken>();
  private keys!: KeyLayout;
  private area: Area = { x: 0, y: 0, width: 0, height: 0 };
  private size = { width: 0, height: 0 };
  private drag: { y: number; time: number } | null = null;
  private song: Song;
  private palette: PixiPalette;
  private fallTime: number;

  constructor(
    private readonly app: Application,
    private readonly options: PianoSceneOptions,
  ) {
    this.song = options.song;
    this.palette = options.palette;
    this.fallTime = options.fallTime;

    const corner = new Graphics().roundRect(0, 0, 24, 24, 6).fill(TINT_NONE);
    this.noteTexture = app.renderer.generateTexture({ target: corner, resolution: 2 });
    corner.destroy();

    this.highway = new NoteHighway(this.noteTexture);
    this.keyboard = new PianoKeyboard(this.palette, options.onKey);
    app.stage.addChild(this.highway, this.hitLine, this.keyboard);

    this.highway.eventMode = 'static';
    this.highway.cursor = 'grab';
    this.highway.on('pointerdown', this.onPointerDown);
    this.highway.on('globalpointermove', this.onPointerMove);
    this.highway.on('pointerup', this.onPointerUp);
    this.highway.on('pointerupoutside', this.onPointerUp);

    app.ticker.add(this.frame);
  }

  setPalette(palette: PixiPalette): void {
    this.palette = palette;
    this.keyboard.setPalette(palette);
    this.relayout();
  }

  setFallTime(seconds: number): void {
    this.fallTime = seconds;
  }

  destroy(): void {
    this.app.ticker.remove(this.frame);
    this.highway.destroy({ children: true });
    this.keyboard.destroy({ children: true });
    this.hitLine.destroy();
    this.noteTexture.destroy(true);
  }

  private relayout(): void {
    const { width, height } = this.app.screen;
    this.size = { width, height };
    const { min, max } = this.song.pitchRange;
    const range = fitKeyRange(min, max);
    this.keys = layoutKeys(range, width);

    const keyboardHeight = Math.min(height * 0.24, this.keys.whiteWidth * 6, 220);
    this.area = { x: 0, y: 0, width, height: height - keyboardHeight };

    this.highway.layout(this.keys, this.area, this.palette);
    this.highway.hitArea = new Rectangle(0, 0, width, this.area.height);

    this.keyboard.y = this.area.height;
    this.keyboard.build(this.keys, keyboardHeight);

    Object.assign(this.hitLine, { x: 0, y: this.area.height - HIT_LINE, width, height: HIT_LINE });
    this.hitLine.tint = this.palette.hitLine.color;
    this.hitLine.alpha = this.palette.hitLine.alpha;
  }

  private frame = (): void => {
    const { width, height } = this.app.screen;
    if (width !== this.size.width || height !== this.size.height) this.relayout();

    const position = this.options.position();
    this.highway.render(
      this.song,
      position,
      this.fallTime,
      this.keys,
      this.area,
      this.palette,
      this.options.markers(),
    );

    this.active.clear();
    forEachNoteInWindow(this.song, position, position + 1e-3, (note) => {
      if (note.start <= position) {
        this.active.set(note.pitch, note.hand === 'left' ? 'handLeft' : 'handRight');
      }
    });
    for (const [pitch, state] of this.options.keyStates()) {
      this.active.set(pitch, KEY_STATE_TOKEN[state]);
    }
    this.keyboard.setActive(this.active);
  };

  private onPointerDown = (event: FederatedPointerEvent): void => {
    this.drag = { y: event.global.y, time: this.options.position() };
    this.highway.cursor = 'grabbing';
    this.options.scrub.onScrubStart();
  };

  private onPointerMove = (event: FederatedPointerEvent): void => {
    if (!this.drag) return;
    const seconds = ((event.global.y - this.drag.y) / this.area.height) * this.fallTime;
    this.options.scrub.onScrub(this.drag.time + seconds);
  };

  private onPointerUp = (): void => {
    if (!this.drag) return;
    this.drag = null;
    this.highway.cursor = 'grab';
    this.options.scrub.onScrubEnd();
  };
}
