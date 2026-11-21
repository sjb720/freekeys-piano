export type Location = {
  path: string;
  query: URLSearchParams;
};

let cached: { hash: string; location: Location } | null = null;

export function parseHash(hash: string): Location {
  const raw = hash.replace(/^#/, '') || '/';
  const [path = '/', search = ''] = raw.split('?');
  return { path: path.startsWith('/') ? path : `/${path}`, query: new URLSearchParams(search) };
}

export function getLocation(): Location {
  const hash = window.location.hash;
  if (cached?.hash !== hash) cached = { hash, location: parseHash(hash) };
  return cached.location;
}

export function navigate(to: string, options: { replace?: boolean } = {}): void {
  const hash = `#${to}`;
  if (options.replace) window.location.replace(hash);
  else window.location.hash = hash;
}

export function back(): void {
  window.history.back();
}

export function subscribe(listener: () => void): () => void {
  window.addEventListener('hashchange', listener);
  return () => window.removeEventListener('hashchange', listener);
}
