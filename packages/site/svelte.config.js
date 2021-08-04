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
        noExternal: ['svelte-portal', 'marked'],
        external: ['fs/promises'],
      },
    },

    prerender: {
      pages: [
        '*',
        '/docs/solid',
        '/docs/svelte',
        ...getFrameworkRoutes('solid'),
        ...getFrameworkRoutes('svelte'),
      ],
    },
  },
};

export default config;
