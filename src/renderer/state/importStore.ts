import { create } from 'zustand';
import type { ImportResult } from '@shared/ipc';

type ImportState = {
  busy: boolean;
  result: ImportResult | null;
  error: string | null;
};

export const useImportStore = create<ImportState>()(() => ({
  busy: false,
  result: null,
  error: null,
}));

export async function runImport(start: () => Promise<ImportResult | null>): Promise<void> {
  if (useImportStore.getState().busy) return;
  useImportStore.setState({ busy: true, error: null });
  try {
    const result = await start();
    useImportStore.setState({ busy: false, result });
  } catch (error) {
    useImportStore.setState({
      busy: false,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

export const dismissImport = () => useImportStore.setState({ result: null, error: null });
