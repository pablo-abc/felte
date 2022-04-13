import typescript from 'rollup-plugin-ts';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import { terser } from 'rollup-plugin-terser';

const prod = !process.env.ROLLUP_WATCH;

export default {
  input: ['./src/index.ts', './src/felte-validation-message.ts'],
  external: ['@felte/common'],
  output: [
    prod && {
      dir: 'dist/min',
      format: 'esm',
      sourcemap: prod,
      exports: 'named',
      plugins: [terser()],
    },
    { dir: 'dist', format: 'esm', sourcemap: prod, exports: 'named' },
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
  ],
};
