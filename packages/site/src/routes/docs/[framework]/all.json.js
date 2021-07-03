import getDocs from '../_docs.js';

export async function get({ query, params }) {
  const docs = await getDocs({
    lang: query.get('lang') ?? 'en',
    framework: params.framework,
    version: query.get('version') ?? 'latest',
    section: 'all',
  });

  if (docs) {
    return {
      body: docs.map((section) => ({
        attributes: {
          id: section.attributes.id,
          section: section.attributes.section,
          subsections: section.attributes.subsections,
        },
      })),
    };
  } else {
    return {
      status: 404,
      body: {
        message: 'Not found',
      },
    };
  }
}
