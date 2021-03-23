import getDocs from './_docs.js';

export async function get(request) {
  const docs = await getDocs({
    lang: request.query.get('lang') ?? 'en',
    version: request.query.get('version') ?? 'latest',
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
