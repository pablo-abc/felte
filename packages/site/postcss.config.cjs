const autoprefixer = require('autoprefixer');
const postcssPresetEnv = require('postcss-preset-env');
const cssnano = require('cssnano');

const mode = process.env.NODE_ENV;
const dev = mode === 'development';

const config = {
  plugins: [
    autoprefixer(),
    postcssPresetEnv(),

    !dev &&
      cssnano({
        preset: 'default',
      }),
  ],
};

module.exports = config;
