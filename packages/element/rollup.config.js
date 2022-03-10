import typescript from 'rollup-plugin-ts';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import bundleSize from 'rollup-plugin-bundle-size';
import { terser } from 'rollup-plugin-terser';
import renameNodeModules from 'rollup-plugin-rename-node-modules';
import pkg from './package.json';

const prod = !process.env.ROLLUP_WATCH;

export default [
  {
    input: './src/index.ts',
    output: [
      {
        file: pkg.main,
        format: 'umd',
        sourcemap: prod,
        exports: 'named',
        name: 'FelteReporterElement',
      },
      prod && {
        file: 'dist/esm/index.min.js',
        format: 'esm',
        sourcemap: prod,
        exports: 'named',
        plugins: [terser(), bundleSize()],
      },
      {
        dir: 'dist/esm',
        format: 'esm',
        sourcemap: prod,
        exports: 'named',
        preserveModules: true,
        preserveModulesRoot: 'src',
      },
    ],
    plugins: [
      replace({
        'process.env.NODE_ENV': JSON.stringify(
          prod ? 'production' : 'development'
        ),
        preventAssignment: true,
      }),
      resolve({ browser: true, exportConditions: prod ? [] : ['development'] }),
      commonjs(),
      typescript({ browserslist: false }),
      renameNodeModules('external', prod),
    ],
  },
];
