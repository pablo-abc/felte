import { _isPlainObject } from './isPlainObject';

export function isEqual(val1: unknown, val2: unknown): boolean {
  if (val1 === val2) return true;
  if (Array.isArray(val1) && Array.isArray(val2)) {
    if (val1.length !== val2.length) return false;
    return val1.every((v, i) => isEqual(v, val2[i]));
  }
  if (_isPlainObject(val1) && _isPlainObject(val2)) {
    const keys1 = Object.keys(val1);
    const keys2 = Object.keys(val2);
    if (keys1.length !== keys2.length) return false;
    return keys1.every((k) => isEqual(val1[k], val2[k]));
  }
  return false;
}
