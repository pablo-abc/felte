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
    let rsValue = customizer(obj, source);
    if (typeof rsValue !== 'undefined') return rsValue;
    const keys = Object.keys(source);
    for (const key of keys) {
      rsValue = customizer(obj[key], source[key]);
      if (typeof rsValue !== 'undefined') {
        obj[key] = rsValue;
      } else if (_isPlainObject(source[key]) && _isPlainObject(obj[key])) {
        obj[key] = _mergeWith(obj[key], source[key], customizer);
      } else if (Array.isArray(source[key])) {
        obj[key] = source[key].map((val: Obj, i: number) => {
          if (!_isPlainObject(val)) return val;
          const newObj = Array.isArray(obj[key]) ? obj[key][i] : obj[key];
          return _mergeWith(newObj, val, customizer);
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
