import type { Obj } from '../types';
import { _cloneDeep } from './cloneDeep';
import { _get } from './get';

/** @ignore */
export function _unset(obj: undefined, path: string | string[]): undefined;
export function _unset<Data extends Obj>(
  obj: Data,
  path: string | string[]
): Data;
export function _unset<Data extends Obj>(
  obj: Data | undefined,
  path: string | string[]
): Data | undefined {
  if (!obj || Object(obj) !== obj) return;
  // When obj is not an object
  else if (typeof obj !== 'undefined') obj = _cloneDeep<Data>(obj);
  // If not yet an array, get the keys from the string-path
  const newPath = !Array.isArray(path)
    ? path.toString().match(/[^.[\]]+/g) || []
    : path;
  const foundProp: any = _get(obj, newPath.slice(0, -1).join('.'));
  if (Array.isArray(foundProp)) {
    foundProp.splice(Number(newPath[newPath.length - 1]), 1);
  } else {
    delete foundProp?.[newPath[newPath.length - 1]];
  }
  return obj as Data;
}
