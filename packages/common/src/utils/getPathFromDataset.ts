import type { FormControl } from '../types';
import { getIndex } from './getIndex';

export function getPathFromDataset(el: FormControl) {
  const fieldSetName = el.dataset.felteFieldset;
  const index = getIndex(el);
  const fieldName =
    typeof index === 'undefined' ? el.name : `${el.name}[${index}]`;
  return fieldSetName ? `${fieldSetName}.${fieldName}` : fieldName;
}
