import fm from 'front-matter';
import path from 'path';
import fs from 'fs/promises';
import { encode } from 'html-entities';

function idfy(value) {
  return value.toLowerCase().replace(/[^a-zA-Z0-9]/g, '-');
}

export default async function getDocs({ lang = 'en', version = 'latest' }) {
  const getFilePath = (fileName) =>
    path.resolve(`./markdown/docs/${lang}/${version}/${fileName}.md`);

  async function readMd(fileName) {
    const filePath = getFilePath(fileName);
    const file = await fs.readFile(filePath, { encoding: 'utf8' });
    const data = fm(file);
    const id = idfy(data.attributes.section);
    data.attributes.id = id;
    data.attributes.subsections = data.attributes.subsections?.map(
      (subsection) => ({ id: idfy(subsection), name: subsection })
    );
    data.body = encode(data.body);
    return data;
  }

  try {
    const sections = [
      'getting-started',
      'validation',
      'validators',
      'default-data',
      'nested-forms',
      'dynamic-forms',
      'stores',
      'helpers',
      'reporters',
      'custom-controls',
      'accessibility',
    ];
    return Promise.all(sections.map(readMd));
  } catch {
    return;
  }
}
