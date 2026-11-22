import { describe, expect, it } from 'vitest';
import { bumpVersion, compareVersions, parseVersion } from '../scripts/version.mts';

describe('release versions', () => {
  it('bumps each part', () => {
    expect(bumpVersion('0.1.0', 'patch')).toBe('0.1.1');
    expect(bumpVersion('0.1.3', 'minor')).toBe('0.2.0');
    expect(bumpVersion('0.9.3', 'major')).toBe('1.0.0');
  });

  it('parses and compares', () => {
    expect(parseVersion('v1.2.3')).toEqual([1, 2, 3]);
    expect(() => parseVersion('1.2')).toThrow(/not a version/);
    expect(compareVersions('0.10.0', '0.9.9')).toBeGreaterThan(0);
    expect(compareVersions('1.0.0', '1.0.0')).toBe(0);
  });
});
