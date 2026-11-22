import { describe, expect, it, vi } from 'vitest';

vi.mock('electron', () => ({ session: {} }));

const { isAllowedPermission } = await import('../src/main/permissions');

describe('permissions', () => {
  it('allows Web MIDI, which Chromium requests as midiSysex', () => {
    expect(isAllowedPermission('midi')).toBe(true);
    expect(isAllowedPermission('midiSysex')).toBe(true);
  });

  it('denies everything else', () => {
    for (const p of ['media', 'geolocation', 'notifications', 'clipboard-read']) {
      expect(isAllowedPermission(p)).toBe(false);
    }
  });
});
