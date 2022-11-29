import typescript from '@rollup/plugin-typescript';
import babel from '@rollup/plugin-babel';
import nodeResolve from '@rollup/plugin-node-resolve';
import renameNodeModules from 'rollup-plugin-rename-node-modules';
import pkg from './package.json' assert { type: 'json' };

const prod = process.env.NODE_ENV === 'production';

export default {
  input: 'src/index.tsx',
  output: [
    {
      file: pkg.main,
      format: 'cjs',
    },
    {
      dir: './dist/esm',
      format: 'es',
      exports: 'named',
      sourcemap: true,
      preserveModules: true,
      preserveModulesRoot: 'src',
    },
  ],
  external: ['preact', 'preact/hooks', '@felte/common'],
  plugins: [
    nodeResolve({
      extensions: ['.js', '.ts', '.tsx'],
    }),
    typescript({
      tsconfig: 'tsconfig.build.json',
    }),
    babel({
      extensions: ['.js', '.ts', '.tsx'],
      babelHelpers: 'bundled',
      presets: ['@babel/preset-env'],
      plugins: [
        ['@babel/transform-react-jsx', { pragma: 'h', pragmaFrag: 'Fragment' }],
        'babel-plugin-annotate-pure-calls',
        'babel-plugin-dev-expression',
      ],
      exclude: 'node_modules/**',
    }),
    renameNodeModules('external', prod),
  ],
};
