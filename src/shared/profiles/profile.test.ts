import { describe, expect, it } from 'vitest';
import { profileInputError, suggestAvatar, type Profile } from './profile';

describe('profileInputError', () => {
  const ok = { name: 'Sam', icon: 'cat', color: 1 } as const;

  it('accepts a valid profile', () => {
    expect(profileInputError(ok)).toBeNull();
  });

  it('rejects empty, long, and duplicate names', () => {
    expect(profileInputError({ ...ok, name: '   ' })).toMatch(/name/);
    expect(profileInputError({ ...ok, name: 'x'.repeat(25) })).toMatch(/24/);
    expect(profileInputError({ ...ok, name: ' sam ' }, ['Sam'])).toMatch(/used/);
  });

  it('rejects unknown avatars', () => {
    expect(profileInputError({ ...ok, icon: 'dragon' as never })).toMatch(/avatar/);
    expect(profileInputError({ ...ok, color: 9 as never })).toMatch(/color/);
  });
});

describe('suggestAvatar', () => {
  it('cycles through icons and colors', () => {
    expect(suggestAvatar([])).toEqual({ icon: 'cat', color: 1 });
    expect(suggestAvatar([{} as Profile])).toEqual({ icon: 'dog', color: 2 });
  });
});
