import getDocs from '../_docs.js';

export async function get({ params }) {
  const docs = await getDocs({
    framework: params.framework,
    section: 'all',
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
