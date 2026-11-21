import { describe, expect, it } from 'vitest';
import { buildRouteTable, matchRoute, matchSegments, parseSegment } from './routeTable';

const ROOT = '../pages/';
const modules = Object.fromEntries(
  [
    '_layout',
    'index',
    'library/index',
    'library/favorites',
    'play/_layout',
    'play/[songId]',
    'profiles/[profileId]/settings',
    '[...rest]',
    'library/_helpers',
  ].map((p) => [`${ROOT}${p}.tsx`, p]),
);

const table = buildRouteTable(modules, ROOT);
const find = (path: string) => matchRoute(table, path);

describe('parseSegment', () => {
  it('parses static, param, and rest', () => {
    expect(parseSegment('library')).toEqual({ type: 'static', value: 'library' });
    expect(parseSegment('[songId]')).toEqual({ type: 'param', name: 'songId' });
    expect(parseSegment('[...rest]')).toEqual({ type: 'rest', name: 'rest' });
  });
});

describe('buildRouteTable', () => {
  it('builds patterns and skips underscore files', () => {
    expect(table.map((r) => r.pattern).sort()).toEqual(
      [
        '/',
        '/library',
        '/library/favorites',
        '/play/:songId',
        '/profiles/:profileId/settings',
        '/*rest',
      ].sort(),
    );
  });

  it('orders static before param before rest', () => {
    expect(table.at(-1)!.pattern).toBe('/*rest');
  });

  it('chains layouts outer to inner', () => {
    expect(find('/play/abc')!.route.layouts).toEqual(['_layout', 'play/_layout']);
    expect(find('/library')!.route.layouts).toEqual(['_layout']);
  });
});

describe('matchRoute', () => {
  it('matches index routes', () => {
    expect(find('/')!.route.load).toBe('index');
    expect(find('/library')!.route.load).toBe('library/index');
    expect(find('/library/')!.route.load).toBe('library/index');
  });

  it('extracts and decodes params', () => {
    expect(find('/play/a%20b')!.params).toEqual({ songId: 'a b' });
    expect(find('/profiles/7/settings')!.params).toEqual({ profileId: '7' });
  });

  it('prefers static over dynamic', () => {
    expect(find('/library/favorites')!.route.load).toBe('library/favorites');
  });

  it('falls back to catch-all', () => {
    const m = find('/nope/deep')!;
    expect(m.route.load).toBe('[...rest]');
    expect(m.params).toEqual({ rest: 'nope/deep' });
  });
});

describe('matchSegments', () => {
  it('rejects extra or missing parts', () => {
    const segs = [parseSegment('play'), parseSegment('[id]')];
    expect(matchSegments(segs, '/play')).toBeNull();
    expect(matchSegments(segs, '/play/1/2')).toBeNull();
  });

  it('requires at least one part for rest', () => {
    expect(matchSegments([parseSegment('[...rest]')], '/')).toBeNull();
  });
});
