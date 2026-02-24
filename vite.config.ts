import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  server: {
    port: 3002,
    open: true,
  },
  build: {
    outDir: 'build',
    sourcemap: false,
  },
});
