import { join } from 'node:path';
import { utilityProcess } from 'electron';
import type { AnalyzeResult } from './analyzeFile';
import type { AnalyzeRunner } from './Scanner';

type Message = { type: 'result'; result: AnalyzeResult } | { type: 'done' };

export const runInUtilityProcess: AnalyzeRunner = (paths, overrides, onResult) =>
  new Promise((resolve, reject) => {
    const child = utilityProcess.fork(join(__dirname, 'libraryWorker.js'), [], {
      serviceName: 'Library scanner',
    });
    let finished = false;
    child.on('message', (message: Message) => {
      if (message.type === 'result') return onResult(message.result);
      finished = true;
      child.kill();
      resolve();
    });
    child.on('exit', (code) => {
      if (!finished) reject(new Error(`Library scanner exited with code ${code}`));
    });
    child.postMessage({ paths, overrides });
  });
