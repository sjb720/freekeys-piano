import type { HandOverride } from '@shared/song';
import { analyzeFile } from './analyzeFile';

type Request = { paths: string[]; overrides: Record<string, HandOverride> };

process.parentPort.on('message', ({ data }: { data: Request }) => {
  for (const path of data.paths) {
    process.parentPort.postMessage({ type: 'result', result: analyzeFile(path, data.overrides) });
  }
  process.parentPort.postMessage({ type: 'done' });
});
