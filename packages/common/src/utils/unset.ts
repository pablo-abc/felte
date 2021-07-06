import type { Obj } from '../types';
import { _cloneDeep } from './cloneDeep';

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
  if (Object(obj) !== obj) return;
  // When obj is not an object
  else if (typeof obj !== 'undefined') obj = _cloneDeep<Data>(obj);
  // If not yet an array, get the keys from the string-path
  let newPath = !Array.isArray(path)
    ? path.toString().match(/[^.[\]]+/g) || []
    : path;
  delete newPath.slice(0, -1).reduce(
    (a: any, c: any) =>
      Object(a[c]) === a[c] // Does the key exist and is its value an object?
        ? // Yes: then follow that path
          a[c]
        : undefined,
    obj
  )?.[newPath[newPath.length - 1]];
  return obj as Data; // Return the top-level object to allow chaining
}
