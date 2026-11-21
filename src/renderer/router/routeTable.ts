export type Segment =
  | { type: 'static'; value: string }
  | { type: 'param'; name: string }
  | { type: 'rest'; name: string };

export type Params = Record<string, string>;

export type RouteEntry<L> = {
  file: string;
  pattern: string;
  segments: Segment[];
  load: L;
  layouts: L[];
};

const PAGE_EXT = /\.tsx$/;

export function parseSegment(raw: string): Segment {
  const rest = raw.match(/^\[\.\.\.(\w+)\]$/);
  if (rest) return { type: 'rest', name: rest[1]! };
  const param = raw.match(/^\[(\w+)\]$/);
  if (param) return { type: 'param', name: param[1]! };
  return { type: 'static', value: raw };
}

const RANK = { static: 4, param: 3, end: 2, rest: 1 } as const;
const segmentRank = (s: Segment | undefined) => RANK[s?.type ?? 'end'];

export function compareRoutes(a: Segment[], b: Segment[]): number {
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const ra = segmentRank(a[i]);
    const rb = segmentRank(b[i]);
    if (ra !== rb) return rb - ra;
  }
  return 0;
}

const toPattern = (segments: Segment[]) =>
  '/' +
  segments
    .map((s) => (s.type === 'static' ? s.value : s.type === 'param' ? `:${s.name}` : `*${s.name}`))
    .join('/');

export function buildRouteTable<L>(modules: Record<string, L>, root: string): RouteEntry<L>[] {
  const layouts = new Map<string, L>();
  const pages: { file: string; parts: string[]; load: L }[] = [];

  for (const [path, load] of Object.entries(modules)) {
    if (!path.startsWith(root)) continue;
    const parts = path.slice(root.length).replace(PAGE_EXT, '').split('/').filter(Boolean);
    const name = parts.at(-1);
    if (name === '_layout') layouts.set(parts.slice(0, -1).join('/'), load);
    else if (name && !name.startsWith('_')) pages.push({ file: path, parts, load });
  }

  return pages
    .map(({ file, parts, load }) => {
      const routeParts = parts.at(-1) === 'index' ? parts.slice(0, -1) : parts;
      const segments = routeParts.map(parseSegment);
      const chain: L[] = [];
      for (let depth = 0; depth < parts.length; depth++) {
        const layout = layouts.get(parts.slice(0, depth).join('/'));
        if (layout) chain.push(layout);
      }
      return { file, pattern: toPattern(segments), segments, load, layouts: chain };
    })
    .sort((a, b) => compareRoutes(a.segments, b.segments));
}

export function matchSegments(segments: Segment[], path: string): Params | null {
  const parts = path.split('/').filter(Boolean).map(decodeURIComponent);
  const params: Params = {};

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i]!;
    if (seg.type === 'rest') {
      if (parts.length <= i) return null;
      params[seg.name] = parts.slice(i).join('/');
      return params;
    }
    const part = parts[i];
    if (part === undefined) return null;
    if (seg.type === 'static' && seg.value !== part) return null;
    if (seg.type === 'param') params[seg.name] = part;
  }

  return parts.length === segments.length ? params : null;
}

export function matchRoute<L>(
  routes: RouteEntry<L>[],
  path: string,
): { route: RouteEntry<L>; params: Params } | null {
  for (const route of routes) {
    const params = matchSegments(route.segments, path);
    if (params) return { route, params };
  }
  return null;
}
