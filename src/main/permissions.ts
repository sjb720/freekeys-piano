import { session } from 'electron';

// Chromium requests 'midiSysex' for every Web MIDI call, even without sysex.
const ALLOWED = new Set<string>(['midi', 'midiSysex']);

export const isAllowedPermission = (permission: string): boolean => ALLOWED.has(permission);

export function configurePermissions(): void {
  const { defaultSession } = session;
  defaultSession.setPermissionRequestHandler((_wc, permission, callback) =>
    callback(isAllowedPermission(permission)),
  );
  defaultSession.setPermissionCheckHandler((_wc, permission) => isAllowedPermission(permission));
}
