import { describe, expect, it } from 'vitest';
import { defaultSettings, formatSettingValue, SETTING_KEYS, SETTINGS } from './registry';

describe('settings registry', () => {
  it('produces a default for every key', () => {
    expect(Object.keys(defaultSettings()).sort()).toEqual([...SETTING_KEYS].sort());
  });

  it('keeps slider defaults within range', () => {
    for (const def of Object.values(SETTINGS)) {
      if (def.control.type !== 'slider') continue;
      expect(def.default).toBeGreaterThanOrEqual(def.control.min);
      expect(def.default).toBeLessThanOrEqual(def.control.max);
    }
  });

  it('formats slider values', () => {
    expect(formatSettingValue(SETTINGS.volume.control, 0.8)).toBe('80%');
    expect(formatSettingValue(SETTINGS.noteFallTime.control, 2.5)).toBe('2.5 s');
  });
});
