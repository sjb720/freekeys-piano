import { session } from 'electron';

const ALLOWED = new Set<string>(['midi']);

export function configurePermissions(): void {
  const { defaultSession } = session;
  defaultSession.setPermissionRequestHandler((_wc, permission, callback) =>
    callback(ALLOWED.has(permission)),
  );
  defaultSession.setPermissionCheckHandler((_wc, permission) => ALLOWED.has(permission));
}
