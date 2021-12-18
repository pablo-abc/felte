import svelte from 'rollup-plugin-svelte';
import autoPreprocess from 'svelte-preprocess';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import { terser } from 'rollup-plugin-terser';
import bundleSize from 'rollup-plugin-bundle-size';
import pkg from './package.json';

const prod = process.env.NODE_ENV === 'production';
const name = pkg.name
  .replace(/^(@\S+\/)?(svelte-)?(\S+)/, '$3')
  .replace(/^\w/, (m) => m.toUpperCase())
  .replace(/-\w/g, (m) => m[1].toUpperCase());

export default {
  input: './src/index.js',
  external: ['svelte', 'svelte/store', 'svelte/internal'],
  output: [
    { file: pkg.browser, format: 'cjs', sourcemap: prod, name },
    { file: pkg.module, format: 'esm', sourcemap: prod },
  ],
  plugins: [
    replace({
      'process.env.NODE_ENV': JSON.stringify(
        prod ? 'production' : 'development'
      ),
      preventAssignment: true,
    }),
    svelte({
      preprocess: autoPreprocess(),
    }),
    resolve({ browser: true }),
    commonjs(),
    prod && terser(),
    prod && bundleSize(),
  ],
};
