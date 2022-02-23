import { sections } from './docs/_docs.js';

const host = 'https://felte.dev';

function getFrameworkRoutes(framework) {
  return sections.latest[framework].map((section) => {
    return `${host}/docs/${framework}/${section}`;
  });
}

const routes = [
  host + '/',
  host + '/docs',
  host + '/docs/solid',
  host + '/docs/svelte',
  host + '/docs/react',
  host + '/docs/solid/search',
  host + '/docs/svelte/search',
  host + '/docs/react/search',
  ...getFrameworkRoutes('solid'),
  ...getFrameworkRoutes('svelte'),
  ...getFrameworkRoutes('react'),
];

const xmlUrls = routes.map((route) => {
  return `<url><loc>${route}</loc></url>`;
});

export async function get() {
  return {
    headers: {
      'Content-Type': 'application/xml',
    },
    body: `
      <?xml version="1.0" encoding="UTF-8" ?>
      <urlset
        xmlns="https://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="https://www.w3.org/1999/xhtml"
        xmlns:mobile="https://www.google.com/schemas/sitemap-mobile/1.0"
        xmlns:news="https://www.google.com/schemas/sitemap-news/0.9"
        xmlns:image="https://www.google.com/schemas/sitemap-image/1.1"
        xmlns:video="https://www.google.com/schemas/sitemap-video/1.1"
      >
        ${xmlUrls.join('')}
      </urlset>
    `.trim(),
  };
}
