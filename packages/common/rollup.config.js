import typescript from 'rollup-plugin-ts';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import bundleSize from 'rollup-plugin-bundle-size';
import pkg from './package.json';
import * as fs from 'fs';

const modules = fs
  .readdirSync('./src/utils')
  .map((module) => `./src/utils/${module}`);

const prod = process.env.NODE_ENV === 'production';
const name = pkg.name
  .replace(/^(@\S+\/)?(svelte-)?(\S+)/, '$3')
  .replace(/^\w/, (m) => m.toUpperCase())
  .replace(/-\w/g, (m) => m[1].toUpperCase());

export default [
  {
    input: './src/index.ts',
    output: {
      file: pkg.browser,
      format: 'cjs',
      sourcemap: prod,
      exports: 'named',
      name,
    },
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

      prod && bundleSize(),
    ],
  },
  {
    input: ['./src/index.ts', ...modules],
    output: {
      dir: 'dist/esm',
      format: 'esm',
      sourcemap: prod,
      exports: 'named',
      preserveModules: true,
    },
    plugins: [
      replace({
        'process.env.NODE_ENV': JSON.stringify(
          prod ? 'production' : 'development'
        ),
        preventAssignment: true,
      }),
      resolve({ browser: true }),
      commonjs(),
      typescript({
        declarationDir: './dist/esm',
      }),
    ],
  },
];
