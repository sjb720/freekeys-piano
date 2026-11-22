import { Container, Sprite, Text, Texture, type FederatedPointerEvent } from 'pixi.js';
import type { KeyLabelMode } from '@shared/settings';
import { TINT_NONE, type ColorToken, type PixiPalette } from '@renderer/themes';
import { BLACK_KEY_HEIGHT, type KeyLayout } from './keyLayout';
import { LABEL_FONT_FAMILY, labelFor } from './labels';

const KEY_GAP = 2;

export class PianoKeyboard extends Container {
  private readonly backdrop = new Sprite(Texture.WHITE);
  private sprites = new Map<number, { sprite: Sprite; black: boolean }>();
  private readonly labels = new Container();
  private layout: { keys: KeyLayout; height: number } | null = null;
  private pitchOf = new Map<Container, number>();
  private pointers = new Map<number, number>();
  private active = new Map<number, ColorToken>();

  constructor(
    private palette: PixiPalette,
    private readonly onKey: (pitch: number, down: boolean) => void,
    private labelMode: KeyLabelMode = 'off',
  ) {
    super();
    this.addChild(this.backdrop);
    this.labels.eventMode = 'none';
    this.eventMode = 'static';
    this.on('pointerdown', this.onPointerDown);
    this.on('pointerup', this.onPointerUp);
    this.on('pointerupoutside', this.onPointerUp);
    this.on('pointercancel', this.onPointerUp);
  }

  build(layout: KeyLayout, height: number): void {
    for (const { sprite } of this.sprites.values()) sprite.destroy();
    this.sprites.clear();
    this.pitchOf.clear();

    this.backdrop.width = layout.width;
    this.backdrop.height = height;

    for (const key of layout.keys) {
      const sprite = new Sprite(Texture.WHITE);
      sprite.x = key.black ? key.x : key.x + KEY_GAP / 2;
      sprite.width = key.black ? key.width : key.width - KEY_GAP;
      sprite.height = key.black ? height * BLACK_KEY_HEIGHT : height;
      sprite.eventMode = 'static';
      sprite.cursor = 'pointer';
      this.addChild(sprite);
      this.sprites.set(key.pitch, { sprite, black: key.black });
      this.pitchOf.set(sprite, key.pitch);
    }
    this.layout = { keys: layout, height };
    this.addChild(this.labels);
    this.buildLabels();
    this.applyTints();
  }

  setLabelMode(mode: KeyLabelMode): void {
    if (mode === this.labelMode) return;
    this.labelMode = mode;
    this.buildLabels();
  }

  setPalette(palette: PixiPalette): void {
    this.palette = palette;
    this.applyTints();
    this.buildLabels();
  }

  setActive(next: Map<number, ColorToken>): void {
    for (const pitch of this.active.keys()) if (!next.has(pitch)) this.tintKey(pitch, undefined);
    for (const [pitch, token] of next)
      if (this.active.get(pitch) !== token) this.tintKey(pitch, token);
    this.active = new Map(next);
  }

  private onPointerDown = (event: FederatedPointerEvent): void => {
    const pitch = this.pitchOf.get(event.target as Container);
    if (pitch === undefined) return;
    this.pointers.set(event.pointerId, pitch);
    this.onKey(pitch, true);
  };

  private onPointerUp = (event: FederatedPointerEvent): void => {
    const pitch = this.pointers.get(event.pointerId);
    if (pitch === undefined) return;
    this.pointers.delete(event.pointerId);
    this.onKey(pitch, false);
  };

  private buildLabels(): void {
    for (const child of this.labels.removeChildren()) child.destroy();
    if (!this.layout) return;
    const { keys, height } = this.layout;
    const whiteSize = Math.min(16, keys.whiteWidth * 0.48);
    for (const key of keys.keys) {
      const text = labelFor(key.pitch, key.black, this.labelMode);
      if (!text) continue;
      const fontSize = key.black ? Math.min(11, key.width * 0.6) : whiteSize;
      const label = new Text({
        text,
        resolution: 2,
        style: { fontFamily: LABEL_FONT_FAMILY, fontSize, fontWeight: '600', fill: TINT_NONE },
      });
      const { color, alpha } = this.palette[key.black ? 'keyLabelOnBlack' : 'keyLabel'];
      label.tint = color;
      label.alpha = alpha;
      label.anchor.set(0.5, 1);
      label.x = key.x + key.width / 2;
      label.y = (key.black ? height * BLACK_KEY_HEIGHT : height) - fontSize * 0.5;
      this.labels.addChild(label);
    }
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
