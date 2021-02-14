import svelte from 'rollup-plugin-svelte';
import autoPreprocess from 'svelte-preprocess';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import { terser } from 'rollup-plugin-terser';
import pkg from './package.json';

const prod = process.env.NODE_ENV === 'production';
const name = pkg.name
  .replace(/^(@\S+\/)?(svelte-)?(\S+)/, '$3')
  .replace(/^\w/, (m) => m.toUpperCase())
  .replace(/-\w/g, (m) => m[1].toUpperCase());

export default {
  input: './src/index.js',
  external: ['tippy.js'],
  output: [
    { file: pkg.browser, format: 'umd', sourcemap: prod, name },
    { file: pkg.module, format: 'esm', sourcemap: prod },
  ],
  plugins: [
    replace({
      'process.env.NODE_ENV': JSON.stringify(
        prod ? 'production' : 'development'
      ),
    }),
    svelte({
      preprocess: autoPreprocess(),
    }),
    resolve({ browser: true }),
    commonjs(),
    prod && terser(),
  ],
};
