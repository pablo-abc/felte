import { parse } from 'path';
import { addHook } from 'pirates';
import { compile } from 'svelte/compiler';

function transform(source, filename) {
  const { name } = parse(filename);

  const { js, warnings } = compile(source, {
    name: name[0].toUpperCase() + name.substring(1),
    format: 'cjs',
    filename,
  });

  warnings.forEach((warning) => {
    console.warn(`\nSvelte Warning in ${warning.filename}:`);
    console.warn(warning.message);
    console.warn(warning.frame);
  });

  return js.code;
}

addHook(transform, { exts: ['.svelte'] });
