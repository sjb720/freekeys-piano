export const DOUBLE_TAP_MS = 400;

export type PedalTap = 'single' | 'double';

// Fires 'single' on every press so pausing feels instant; a second press inside the window fires 'double'.
export class PedalTaps {
  private down = false;
  private lastPress = -Infinity;

  constructor(
    private readonly onTap: (tap: PedalTap) => void,
    private readonly windowMs = DOUBLE_TAP_MS,
  ) {}

  update(down: boolean, now: number): void {
    if (down === this.down) return;
    this.down = down;
    if (!down) return;
    if (now - this.lastPress <= this.windowMs) {
      this.lastPress = -Infinity;
      this.onTap('double');
    } else {
      this.lastPress = now;
      this.onTap('single');
    }
  }
}
