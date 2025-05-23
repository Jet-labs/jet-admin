// packages/shared-utils/rollup.config.js
// Must use CJS syntax for the config file itself if running with --bundleConfigAsCjs or rename to .cjs/.mjs
// Alternatively, add "type": "module" to the shared package's package.json, then you can use ESM here.

import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
// import babel from '@rollup/plugin-babel'; // Uncomment if using Babel

// If using "type": "module" in package.json, you might need this for __dirname
// import path from 'path';
// import { fileURLToPath } from 'url';
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// eslint-disable-next-line import/no-anonymous-default-export
export default {
  input: "src/index.js", // Your main entry point
  output: [
    {
      file: "dist/index.cjs", // CommonJS output
      format: "cjs", // Output format
      sourcemap: true, // Generate source maps
      exports: "named", // Preserve named exports
    },
    {
      file: "dist/index.mjs", // ES Module output
      format: "esm", // Output format
      sourcemap: true, // Generate source maps
    },
  ],
  plugins: [
    resolve(), // Finds external modules in node_modules
    commonjs(), // Converts CJS dependencies to ESM
    // Uncomment if using Babel:
    // babel({
    //   babelHelpers: 'bundled', // Include Babel helpers in the bundle
    //   exclude: 'node_modules/**', // Don't transpile dependencies
    //   presets: ['@babel/preset-env'],
    // }),
  ],
  // If your shared code has external dependencies (like lodash, zod) that you
  // DON'T want to bundle into your shared package, list them here.
  // They will be treated as peer dependencies.
  // external: ['lodash', 'zod']
};
