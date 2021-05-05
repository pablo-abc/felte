import type { FormControl } from '../types';

function getIndex(el: HTMLElement) {
  return el.hasAttribute('data-felte-index')
    ? Number(el.dataset.felteIndex)
    : undefined;
}

/**
 * @category Helper
 */
export function getPath(el: FormControl): string {
  const fieldSetName = el.dataset.felteFieldset;
  const index = getIndex(el);
  const fieldName =
    typeof index === 'undefined' ? el.name : `${el.name}[${index}]`;
  return fieldSetName ? `${fieldSetName}.${fieldName}` : fieldName;
}
