import preprocess from 'svelte-preprocess';
import { mdsvex } from 'mdsvex';
import mdsvexConfig from './mdsvex.config.js';
import adapter from '@sveltejs/adapter-static';
import { sections } from './src/routes/docs/_docs.js';

function getFrameworkRoutes(framework) {
  return sections[framework].map((section) => {
    return `/docs/${framework}/${section}`;
  });
}

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: [
    mdsvex(mdsvexConfig),
    preprocess({
      postcss: true,
    }),
  ],
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

    prerender: {
      entries: [
        '*',
        '/docs/solid',
        '/docs/svelte',
        '/docs/solid/search',
        '/docs/svelte/search',
        ...getFrameworkRoutes('solid'),
        ...getFrameworkRoutes('svelte'),
        ...getFrameworkRoutes('react'),
      ],
    },
  },
};

export default config;
