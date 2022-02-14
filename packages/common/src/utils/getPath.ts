import type { FormControl } from '../types';
import { isFormControl } from './typeGuards';

/**
 * @category Helper
 */
export function getPath(
  el: HTMLElement | FormControl,
  name?: string | undefined
): string {
  return name ?? (isFormControl(el) ? el.name : '');
}
