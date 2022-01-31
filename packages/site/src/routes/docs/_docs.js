import 'dotenv/config';
import fm from 'front-matter';
import path from 'path';
import fs from 'fs/promises';

export const sections = {
  latest: {
    svelte: [
      'getting-started',
      'submitting',
      'validation',
      'validators',
      'transformations',
      'default-data',
      'nested-forms',
      'dynamic-forms',
      'stores',
      'helper-functions',
      'field-arrays',
      'reporters',
      'custom-form-controls',
      'multi-page-forms',
      'accessibility',
      'extending-felte',
      'configuration-reference',
      'migrating',
    ],
    solid: [
      'getting-started',
      'submitting',
      'validation',
      'validators',
      'transformations',
      'default-data',
      'nested-forms',
      'dynamic-forms',
      'stores',
      'helper-functions',
      'field-arrays',
      'reporters',
      'custom-form-controls',
      'multi-page-forms',
      'accessibility',
      'extending-felte',
      'configuration-reference',
      'migrating',
    ],
    react: [
      'getting-started',
      'submitting',
      'validation',
      'validators',
      'transformations',
      'default-data',
      'nested-forms',
      'dynamic-forms',
      'stores',
      'helper-functions',
      'field-arrays',
      'reporters',
      'custom-form-controls',
      'multi-page-forms',
      'accessibility',
      'extending-felte',
      'configuration-reference',
      'migrating',
    ],
  },
  v0: {
    svelte: [
      'getting-started',
      'validation',
      'validators',
      'transformations',
      'default-data',
      'nested-forms',
      'dynamic-forms',
      'stores',
      'helper-functions',
      'reporters',
      'custom-form-controls',
      'multi-page-forms',
      'accessibility',
      'extending-felte',
      'configuration-reference',
    ],
    solid: [
      'getting-started',
      'validation',
      'validators',
      'transformations',
      'default-data',
      'nested-forms',
      'dynamic-forms',
      'stores',
      'helper-functions',
      'reporters',
      'custom-form-controls',
      'multi-page-forms',
      'accessibility',
      'extending-felte',
      'configuration-reference',
    ],
  },
};

function idfy(value) {
  return value.toLowerCase().replace(/[^a-zA-Z0-9]/g, '-');
}

export default async function getDocs({ framework = 'svelte', section }) {
  const version = process.env.FELTE_VERSION ?? 'latest';
  const lang = 'en';
  const getFilePath = (fileName) =>
    path.resolve(
      `./markdown/docs/${version}/${framework}/${lang}/${fileName}.md`
    );

  async function readMd(fileName) {
    const filePath = getFilePath(fileName);
    const file = await fs.readFile(filePath, { encoding: 'utf8' });
    const data = fm(file);
    const id = idfy(data.attributes.section);
    data.attributes.id = id;
    data.attributes.subsections = data.attributes.subsections?.map(
      (subsection) => ({ id: idfy(subsection), name: subsection })
    );
    return data;
  }

  try {
    if (section === 'all')
      return await Promise.all(
        sections[version][framework].map((section) => readMd(section))
      );
    if (section) return await readMd(section);
    return await readMd('introduction');
  } catch (err) {
    return;
  }
}
