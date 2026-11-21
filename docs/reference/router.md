# Router — `src/renderer/router/`

Glob router over `src/renderer/pages/**/*.tsx` with hash history.

## Conventions

| File                       | Route                                                         |
| -------------------------- | ------------------------------------------------------------- |
| `index.tsx`                | folder path (`/`, `/library`)                                 |
| `name.tsx`                 | `/name`                                                       |
| `[param].tsx` / `[param]/` | dynamic segment, read with `useParams`                        |
| `[...rest].tsx`            | catch-all, one or more segments                               |
| `_layout.tsx`              | wraps every page in its folder and subfolders (outer → inner) |
| `_anything.tsx`            | ignored (private helpers)                                     |

Precedence per segment: static > param > end of route > catch-all.

## Exports (`@renderer/router`)

| Name          | Signature                                  | Description                                                    |
| ------------- | ------------------------------------------ | -------------------------------------------------------------- |
| `Router`      | `() => JSX`                                | Renders the matched page inside its layouts; lazy-loads pages. |
| `useParams`   | `<P>() => P`                               | Params of the current route.                                   |
| `useLocation` | `() => Location`                           | `{ path, query: URLSearchParams }`.                            |
| `useNavigate` | `() => { to(path, { replace? }), back() }` | Navigation; never use `window.location` directly.              |

## Internals

| Name                                              | File            | Description                                                |
| ------------------------------------------------- | --------------- | ---------------------------------------------------------- |
| `buildRouteTable(modules, root)`                  | `routeTable.ts` | Glob map → sorted `RouteEntry[]` with layout chains. Pure. |
| `matchRoute(routes, path)`                        | `routeTable.ts` | First matching route and its params, or `null`.            |
| `matchSegments(segments, path)`                   | `routeTable.ts` | Params for one route, or `null`. Decodes URI components.   |
| `parseSegment(raw)`                               | `routeTable.ts` | File/folder name → `Segment`.                              |
| `compareRoutes(a, b)`                             | `routeTable.ts` | Sort comparator by specificity.                            |
| `parseHash(hash)`                                 | `history.ts`    | `#/path?query` → `Location`.                               |
| `getLocation` / `subscribe` / `navigate` / `back` | `history.ts`    | Hash history store used via `useSyncExternalStore`.        |
