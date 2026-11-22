import { resolve } from 'node:path';
import { defineConfig } from 'electron-vite';
import react from '@vitejs/plugin-react';

const alias = {
  '@shared': resolve('src/shared'),
  '@renderer': resolve('src/renderer'),
};

export default defineConfig({
  main: {
    resolve: { alias },
    build: {
      rollupOptions: {
        input: {
          index: resolve('src/main/index.ts'),
          libraryWorker: resolve('src/main/library/worker.ts'),
        },
      },
    },
  },
  preload: { resolve: { alias } },
  renderer: {
    resolve: { alias },
    plugins: [react()],
  },
});
