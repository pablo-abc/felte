import type { Obj } from '../types';
import { _isPlainObject } from './isPlainObject';

/** @ignore */
export function _cloneDeep<T extends Obj>(obj: T): T {
  return Object.keys(obj || {}).reduce(
    (res, key) => ({
      ...res,
      [key]: _isPlainObject(obj[key])
        ? _cloneDeep(obj[key] as T)
        : Array.isArray(obj[key])
        ? [...(obj[key] as any[])]
        : obj[key],
    }),
    {}
  ) as T;
}
