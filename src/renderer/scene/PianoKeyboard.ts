import { Container, Sprite, Texture } from 'pixi.js';
import type { ColorToken, PixiPalette } from '@renderer/themes';
import { BLACK_KEY_HEIGHT, type KeyLayout } from './keyLayout';

const KEY_GAP = 2;

export class PianoKeyboard extends Container {
  private readonly backdrop = new Sprite(Texture.WHITE);
  private sprites = new Map<number, { sprite: Sprite; black: boolean }>();
  private active = new Map<number, ColorToken>();

  constructor(private palette: PixiPalette) {
    super();
    this.addChild(this.backdrop);
  }

  build(layout: KeyLayout, height: number): void {
    for (const { sprite } of this.sprites.values()) sprite.destroy();
    this.sprites.clear();

    this.backdrop.width = layout.width;
    this.backdrop.height = height;

    for (const key of layout.keys) {
      const sprite = new Sprite(Texture.WHITE);
      sprite.x = key.black ? key.x : key.x + KEY_GAP / 2;
      sprite.width = key.black ? key.width : key.width - KEY_GAP;
      sprite.height = key.black ? height * BLACK_KEY_HEIGHT : height;
      this.addChild(sprite);
      this.sprites.set(key.pitch, { sprite, black: key.black });
    }
    this.applyTints();
  }

  setPalette(palette: PixiPalette): void {
    this.palette = palette;
    this.applyTints();
  }

  setActive(next: Map<number, ColorToken>): void {
    for (const pitch of this.active.keys()) if (!next.has(pitch)) this.tintKey(pitch, undefined);
    for (const [pitch, token] of next)
      if (this.active.get(pitch) !== token) this.tintKey(pitch, token);
    this.active = new Map(next);
  }

  private applyTints(): void {
    const bg = this.palette.keyBlack;
    this.backdrop.tint = bg.color;
    this.backdrop.alpha = bg.alpha;
    for (const pitch of this.sprites.keys()) this.tintKey(pitch, this.active.get(pitch));
  }

  private tintKey(pitch: number, token: ColorToken | undefined): void {
    const entry = this.sprites.get(pitch);
    if (!entry) return;
    const { color, alpha } = this.palette[token ?? (entry.black ? 'keyBlack' : 'keyWhite')];
    entry.sprite.tint = color;
    entry.sprite.alpha = alpha;
  }
}
