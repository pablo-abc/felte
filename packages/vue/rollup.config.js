import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import renameNodeModules from 'rollup-plugin-rename-node-modules';
import pkg from './package.json' assert { type: 'json' };

const prod = process.env.NODE_ENV === 'production';

export default {
  input: './src/index.ts',
  external: ['@felte/core', 'vue'],
  output: [
    {
      file: pkg.main,
      format: 'cjs',
      sourcemap: prod,
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
    typescript({ tsconfig: 'tsconfig.build.json' }),
    renameNodeModules('external', prod),
  ],
};
