// Bundles the MCP server into one dependency-free file so plugins can run it
// straight from a git checkout (no npm install).
import { buildSync } from 'esbuild';

buildSync({
  entryPoints: ['src/index.js'],
  bundle: true,
  platform: 'node',
  format: 'esm',
  target: 'node20',
  outfile: 'dist/server.mjs',
  legalComments: 'eof',
  banner: {
    js: "#!/usr/bin/env node\nimport { createRequire as __q4cr } from 'node:module'; const require = __q4cr(import.meta.url);",
  },
});
console.log('built dist/server.mjs');
