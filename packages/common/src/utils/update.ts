import type { Obj } from '../types';
import { _cloneDeep } from './cloneDeep';
import { _isPlainObject } from './isPlainObject';

/** @ignore */
export function _update<Data extends Obj>(
  obj: Data | undefined,
  path: string | string[],
  updater: (value: any) => any
) {
  if (obj) obj = _cloneDeep<Data>(obj);
  if (!_isPlainObject(obj)) obj = {} as Data;
  const splitPath = !Array.isArray(path) ? path.match(/[^.[\]]+/g) || [] : path;
  const lastSection = splitPath[splitPath.length - 1];
  if (!lastSection) return obj;
  let property: any = obj;
  for (let i = 0; i < splitPath.length - 1; i++) {
    const section = splitPath[i];
    if (
      !property[section] ||
      (!_isPlainObject(property[section]) && !Array.isArray(property[section]))
    ) {
      const nextSection = splitPath[i + 1];
      if (isNaN(Number(nextSection))) {
        property[section] = {};
      } else {
        property[section] = [];
      }
    }
    property = property[section];
  }
  property[lastSection] = updater(property[lastSection]);
  return obj;
}
