import fm from 'front-matter';
import path from 'path';
import fs from 'fs/promises';

function idfy(value) {
  return value.toLowerCase().replace(/[^a-zA-Z0-9]/g, '-');
}

const sections = [
  'getting-started',
  'validation',
  'validators',
  'default-data',
  'nested-forms',
  'dynamic-forms',
  'stores',
  'helper-functions',
  'reporters',
  'custom-form-controls',
  'accessibility',
  'extending-felte',
];

export default async function getDocs({
  lang = 'en',
  version = 'latest',
  section,
}) {
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
    return data;
  }

  try {
    if (section === 'all')
      return await Promise.all(sections.map((section) => readMd(section)));
    if (section) return await readMd(section);
    return await readMd('introduction');
  } catch (err) {
    return;
  }
}
