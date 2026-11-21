import { useContext } from 'react';
import { RouteContext, type RouteState } from './context';
import { back, navigate } from './history';
import type { Params } from './routeTable';

function useRouteState(): RouteState {
  const state = useContext(RouteContext);
  if (!state) throw new Error('Router hooks must be used inside <Router>');
  return state;
}

export function useParams<P extends Params = Params>(): P {
  return useRouteState().params as P;
}

export function useLocation() {
  return useRouteState().location;
}

const navigator = { to: navigate, back };

export function useNavigate() {
  return navigator;
}
