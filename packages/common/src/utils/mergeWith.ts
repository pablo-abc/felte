import type { Obj } from '../types';
import { _cloneDeep } from './cloneDeep';
import { _isPlainObject } from './isPlainObject';
import { deepSet } from './deepSet';

/** @ignore */
export function _mergeWith<T extends Obj>(...args: any[]): T {
  const customizer = args.pop();
  const obj = _cloneDeep(args.shift());
  if (args.length === 0) return obj;
  for (const source of args) {
    if (!source) continue;
    const keys = Object.keys(source);
    for (const key of keys) {
      const rsValue = customizer(obj[key], source[key]);
      if (typeof rsValue !== 'undefined') {
        obj[key] = rsValue;
      } else if (_isPlainObject(source[key]) && _isPlainObject(obj[key])) {
        obj[key] = _mergeWith(obj[key], source[key], customizer);
      } else if (Array.isArray(source[key]) && Array.isArray(obj[key])) {
        obj[key] = source[key].map((val: Obj, i: number) => {
          return _mergeWith(obj[key][i], val, customizer);
        });
      } else if (_isPlainObject(source[key])) {
        const defaultObj = deepSet(_cloneDeep(source[key]), undefined);
        obj[key] = _mergeWith(defaultObj, source[key], customizer);
      } else if (typeof source[key] !== 'undefined') {
        obj[key] = source[key];
      }
    }
  }
  return obj;
}
