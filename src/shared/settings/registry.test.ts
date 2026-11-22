import { describe, expect, it } from 'vitest';
import {
  defaultSettings,
  formatSettingValue,
  isValidSettingValue,
  SETTING_KEYS,
  SETTINGS,
} from './registry';

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

  it('keeps segmented defaults among the options', () => {
    for (const def of Object.values(SETTINGS)) {
      if (def.control.type !== 'segmented') continue;
      expect(def.control.options.map((o) => o.value)).toContain(def.default);
    }
  });

  it('formats slider values', () => {
    expect(formatSettingValue(SETTINGS.volume.control, 0.8)).toBe('80%');
    expect(formatSettingValue(SETTINGS.noteFallTime.control, 2.5)).toBe('2.5 s');
  });
});

describe('isValidSettingValue', () => {
  it('checks type, options, and range', () => {
    expect(isValidSettingValue('volume', 0.5)).toBe(true);
    expect(isValidSettingValue('volume', 2)).toBe(false);
    expect(isValidSettingValue('volume', '0.5')).toBe(false);
    expect(isValidSettingValue('keyLabels', 'white')).toBe(true);
    expect(isValidSettingValue('keyLabels', 'purple')).toBe(false);
    expect(isValidSettingValue('missing', 1)).toBe(false);
  });
});
