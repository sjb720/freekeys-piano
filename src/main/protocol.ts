import { resolve, sep } from 'node:path';
import { pathToFileURL } from 'node:url';
import { net, protocol } from 'electron';

export const APP_SCHEME = 'app';
export const APP_ORIGIN = `${APP_SCHEME}://bundle`;

export function registerSchemePrivileges(): void {
  protocol.registerSchemesAsPrivileged([
    {
      scheme: APP_SCHEME,
      privileges: { standard: true, secure: true, supportFetchAPI: true, stream: true },
    },
  ]);
}

export function serveDirectory(root: string): void {
  const base = resolve(root);
  protocol.handle(APP_SCHEME, (request) => {
    const file = resolve(base, `.${decodeURIComponent(new URL(request.url).pathname)}`);
    if (!file.startsWith(base + sep)) return new Response(null, { status: 403 });
    return net.fetch(pathToFileURL(file).toString());
  });
}
