import { BrowserWindow, ipcMain } from 'electron';
import type { IpcArgs, IpcChannel, IpcEvent, IpcEvents, IpcResult } from '@shared/ipc';

export function handle<C extends IpcChannel>(
  channel: C,
  handler: (...args: IpcArgs<C>) => IpcResult<C> | Promise<IpcResult<C>>,
): void {
  ipcMain.handle(channel, (_event, ...args) => handler(...(args as IpcArgs<C>)));
}

export function broadcast<E extends IpcEvent>(event: E, payload: IpcEvents[E]): void {
  for (const win of BrowserWindow.getAllWindows()) win.webContents.send(event, payload);
}
