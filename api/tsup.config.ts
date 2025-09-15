import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/server.ts'],     // add more entries if you have workers/cli, etc.
  outDir: 'dist',
  format: ['esm'],              // stay ESM
  platform: 'node',
  target: 'node20',             // match your runtime
  splitting: false,             // single output file (simple for servers)
  sourcemap: true,
  clean: true,
  dts: false,                   // true if you're publishing a lib
  shims: true                   // provides __dirname/__filename in ESM bundles
});
