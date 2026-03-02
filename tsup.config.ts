import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  target: 'node18',
  outDir: 'dist',
  clean: true,
  splitting: false,
  noExternal: [],
  banner: {
    js: '#!/usr/bin/env node',
  },
  esbuildOptions(options) {
    // Don't bundle the large skills JSON into the npm package — it uses skills/ dir instead
    options.external = [...(options.external ?? []), './bundled-data.json', '*.json'];
  },
});
