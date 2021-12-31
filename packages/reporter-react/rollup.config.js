import typescript from 'rollup-plugin-ts';
import babel from '@rollup/plugin-babel';
import nodeResolve from '@rollup/plugin-node-resolve';
import bundleSize from 'rollup-plugin-bundle-size';

export default {
  input: 'src/index.tsx',
  output: [
    {
      file: 'dist/index.mjs',
      format: 'es',
    },
    {
      file: 'dist/index.js',
      format: 'cjs',
    },
  ],
  external: ['react', 'react-dom'],
  plugins: [
    nodeResolve({
      extensions: ['.js', '.ts', '.tsx'],
    }),
    typescript(),
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
    bundleSize(),
  ],
};
