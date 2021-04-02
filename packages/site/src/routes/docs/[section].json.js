import getDocs from './_docs.js';

export async function get({ query, params }) {
  const docs = await getDocs({
    lang: query.get('lang') ?? 'en',
    version: query.get('version') ?? 'latest',
    section: params.section,
  });

  if (docs) {
    return {
      body:
        params.section === 'all'
          ? docs.map((section) => ({
              attributes: {
                id: section.attributes.id,
                section: section.attributes.section,
                subsections: section.attributes.subsections,
              },
            }))
          : docs,
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
