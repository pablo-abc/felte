import type { FormControl } from '../types';
import { isFormControl } from './typeGuards';
import { getIndex } from './getIndex';

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
  return typeof index === 'undefined' ? path : `${path}[${index}]`;
}
