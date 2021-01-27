import typescript from '@wessberg/rollup-plugin-ts';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import pkg from './package.json';

const prod = process.env.NODE_ENV === 'production';

export default {
  input: './src/index.ts',
  external: ['svelte'],
  output: [
    { file: pkg.browser, format: 'cjs', sourcemap: prod },
    { file: pkg.module, format: 'esm', sourcemap: prod },
  ],
  plugins: [resolve(), commonjs(), typescript()],
};
