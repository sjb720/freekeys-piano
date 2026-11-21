import {
  lazy,
  Suspense,
  useMemo,
  useSyncExternalStore,
  type ComponentType,
  type ReactNode,
} from 'react';
import { RouteContext } from './context';
import { getLocation, subscribe } from './history';
import { buildRouteTable, matchRoute } from './routeTable';

type RouteComponent = ComponentType<{ children?: ReactNode }>;
type Module = { default: RouteComponent };

const PAGES_ROOT = '../pages/';
const modules = import.meta.glob<Module>(['../pages/**/*.tsx', '!../pages/**/*.test.tsx']);
const components = Object.fromEntries(
  Object.entries(modules).map(([path, load]) => [path, lazy(load) as RouteComponent]),
);
const routes = buildRouteTable(components, PAGES_ROOT);

export function Router() {
  const location = useSyncExternalStore(subscribe, getLocation);
  const match = useMemo(() => matchRoute(routes, location.path), [location.path]);

  if (!match) return null;

  const { load: Page, layouts } = match.route;
  const tree = layouts.reduceRight<ReactNode>(
    (child, Layout) => <Layout>{child}</Layout>,
    <Suspense fallback={null}>
      <Page />
    </Suspense>,
  );

  return (
    <RouteContext.Provider value={{ location, params: match.params, pattern: match.route.pattern }}>
      <Suspense fallback={null}>{tree}</Suspense>
    </RouteContext.Provider>
  );
}
