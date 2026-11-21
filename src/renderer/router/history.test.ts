import { describe, expect, it } from 'vitest';
import { parseHash } from './history';

describe('parseHash', () => {
  it('defaults to root', () => {
    expect(parseHash('').path).toBe('/');
    expect(parseHash('#').path).toBe('/');
  });

  it('splits path and query', () => {
    const loc = parseHash('#/library?sort=difficulty');
    expect(loc.path).toBe('/library');
    expect(loc.query.get('sort')).toBe('difficulty');
  });

  it('normalizes a missing leading slash', () => {
    expect(parseHash('#library').path).toBe('/library');
  });
});
