import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import terser from '@rollup/plugin-terser';

const prod = !process.env.ROLLUP_WATCH;

const config = [
  {
    input: ['./src/index.ts', './src/felte-form.ts', './src/felte-field.ts'],
    external: ['@felte/core'],
    output: [
      {
        dir: 'dist',
        format: 'esm',
        sourcemap: prod,
        hoistTransitiveImports: false,
        exports: 'named',
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
      typescript({
        compilerOptions: {
          declaration: true,
          declarationMap: true,
          declarationDir: './dist',
        },
      }),
    ],
  },
];

if (prod) {
  config.push({
    input: ['./src/index.ts', './src/felte-form.ts', './src/felte-field.ts'],
    external: ['@felte/core'],
    output: [
      {
        dir: 'dist/min',
        format: 'esm',
        sourcemap: prod,
        exports: 'named',
        hoistTransitiveImports: false,
        plugins: [terser()],
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
      typescript(),
    ],
  });
}

export default config;
