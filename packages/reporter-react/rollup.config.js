import typescript from 'rollup-plugin-ts';
import babel from '@rollup/plugin-babel';
import nodeResolve from '@rollup/plugin-node-resolve';
import pkg from './package.json';

export default {
  input: 'src/index.tsx',
  output: [
    {
      dir: 'dist/esm',
      format: 'es',
      exports: 'named',
      sourcemap: true,
      preserveModules: true,
      preserveModulesRoot: 'src',
    },
    {
      file: pkg.main,
      format: 'cjs',
    },
  ],
  external: ['react', 'react-dom'],
  plugins: [
    nodeResolve({
      extensions: ['.js', '.ts', '.tsx'],
    }),
    typescript({ browserlist: false }),
    babel({
      extensions: ['.js', '.ts', '.tsx'],
      babelHelpers: 'bundled',
      presets: ['@babel/preset-env', '@babel/preset-react'],
      plugins: [
        'babel-plugin-annotate-pure-calls',
        'babel-plugin-dev-expression',
      ],
      exclude: 'node_modules/**',
    }),
  ],
};
