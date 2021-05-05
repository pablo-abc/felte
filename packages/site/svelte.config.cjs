const { mdsvex } = require('mdsvex');
const mdsvexConfig = require('./mdsvex.config.cjs');
const adapter = require('@sveltejs/adapter-static');
const pkg = require('./package.json');

/** @type {import('@sveltejs/kit').Config} */
module.exports = {
  preprocess: [mdsvex(mdsvexConfig)],
  extensions: ['.svelte', ...mdsvexConfig.extensions],
  kit: {
    // By default, `npm run build` will create a standard Node app.
    // You can create optimized builds for different platforms by
    // specifying a different adapter
    adapter: adapter(),

    // hydrate the <div id="svelte"> element in src/app.html
    target: '#svelte',

    vite: {
      ssr: {
        noExternal: ['svelte-portal'],
        external: ['fs/promises'],
      },
    },
  },
};
