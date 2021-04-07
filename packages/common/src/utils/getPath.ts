import type { FormControl } from '../types';

/**
 * @category Helper
 */
export function getPath(el: FormControl): string {
  const fieldSetName = el.dataset.felteFieldset;
  return fieldSetName ? `${fieldSetName}.${el.name}` : el.name;
}
