import typescript from '@wessberg/rollup-plugin-ts';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import pkg from './package.json';

export default {
  input: './src/index.ts',
  external: ['svelte', 'bueno'],
  output: [
    { file: pkg.main, format: 'cjs', sourcemap: true },
    { file: pkg.module, format: 'esm', sourcemap: true },
  ],
  plugins: [resolve(), commonjs(), typescript()],
};
