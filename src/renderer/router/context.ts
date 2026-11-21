import { createContext } from 'react';
import type { Location } from './history';
import type { Params } from './routeTable';

export type RouteState = {
  location: Location;
  params: Params;
  pattern: string | null;
};

export const RouteContext = createContext<RouteState | null>(null);
