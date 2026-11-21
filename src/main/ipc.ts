import { ipcMain } from 'electron';
import type { IpcArgs, IpcChannel, IpcResult } from '@shared/ipc';

export function handle<C extends IpcChannel>(
  channel: C,
  handler: (...args: IpcArgs<C>) => IpcResult<C> | Promise<IpcResult<C>>,
): void {
  ipcMain.handle(channel, (_event, ...args) => handler(...(args as IpcArgs<C>)));
}
