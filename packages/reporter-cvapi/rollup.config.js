import typescript from '@wessberg/rollup-plugin-ts';
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
  input: './src/index.ts',
  external: ['tippy.js'],
  output: [
    {
      file: pkg.browser,
      format: 'umd',
      sourcemap: prod,
      exports: 'default',
      name,
    },
    { file: pkg.module, format: 'esm', sourcemap: prod, exports: 'default' },
  ],
  plugins: [
    replace({
      'process.env.NODE_ENV': JSON.stringify(
        prod ? 'production' : 'development'
      ),
      preventAssignment: true,
    }),
    resolve({ browser: true }),
    commonjs(),
    typescript(),
    prod && terser(),
    prod && bundleSize(),
  ],
};
