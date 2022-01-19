import typescript from 'rollup-plugin-ts';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import pkg from './package.json';

const prod = process.env.NODE_ENV === 'production';
const name = pkg.name
  .replace(/^(@\S+\/)?(svelte-)?(\S+)/, '$3')
  .replace(/^\w/, (m) => m.toUpperCase())
  .replace(/-\w/g, (m) => m[1].toUpperCase());

export default {
  input: './src/index.ts',
  output: [
    {
      dir: 'dist/cjs',
      format: 'cjs',
      sourcemap: prod,
      exports: 'named',
      name,
      preserveModules: true,
      preserveModulesRoot: 'src',
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
    resolve({ browser: true }),
    commonjs(),
    typescript({ browserslist: false }),
  ],
};
