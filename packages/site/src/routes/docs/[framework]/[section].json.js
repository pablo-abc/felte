import getDocs from '../_docs.js';

export async function get({ query, params }) {
  const docs = await getDocs({
    lang: query.get('lang') ?? 'en',
    framework: params.framework,
    version: query.get('version') ?? 'latest',
    section: params.section,
  });

  if (docs) {
    return {
      body: docs,
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
