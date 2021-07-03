import type { FormControl } from '../types';
import { isFieldSetElement, isFormControl } from './typeGuards';

function getIndex(el: HTMLElement) {
  return el.hasAttribute('data-felte-index')
    ? Number(el.dataset.felteIndex)
    : undefined;
}

/**
 * @category Helper
 */
export function getPath(
  el: HTMLElement | FormControl,
  name?: string | undefined
): string {
  const index = getIndex(el);
  let path = '';
  if (name) {
    path = name;
  } else if (isFormControl(el)) {
    path = el.name;
  }
  path = typeof index === 'undefined' ? path : `${path}[${index}]`;
  let parent = el.parentNode;
  if (!parent) return path;
  while (parent && parent.nodeName !== 'FORM') {
    if (isFieldSetElement(parent) && parent.name) {
      const index = getIndex(parent);
      const fieldsetName =
        typeof index === 'undefined' ? parent.name : `${parent.name}[${index}]`;
      path = `${fieldsetName}.${path}`;
    }
    parent = parent.parentNode;
  }
  return path;
}
