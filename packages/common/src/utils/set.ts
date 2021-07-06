import type { Obj, FieldValue } from '../types';
import { _cloneDeep } from './cloneDeep';

/* From: https://stackoverflow.com/a/54733755 */

/** @ignore */
export function _set<Data extends Obj>(
  obj: Data | undefined,
  path: string | string[],
  value: FieldValue | FieldValue[]
) {
  if (Object(obj) !== obj) obj = {} as Data;
  // When obj is not an object
  else if (typeof obj !== 'undefined') obj = _cloneDeep<Data>(obj);
  // If not yet an array, get the keys from the string-path
  let newPath = !Array.isArray(path)
    ? path.toString().match(/[^.[\]]+/g) || []
    : path;
  newPath.slice(0, -1).reduce(
    (
      a: any,
      c: any,
      i: any // Iterate all of them except the last one
    ) =>
      Object(a[c]) === a[c] // Does the key exist and is its value an object?
        ? // Yes: then follow that path
          a[c]
        : // No: create the key. Is the next key a potential array-index?
          (a[c] =
            Math.abs(Number(newPath[i + 1])) >> 0 === +newPath[i + 1]
              ? [] // Yes: assign a new array object
              : {}), // No: assign a new plain object
    obj
  )[newPath[newPath.length - 1]] = value; // Finally assign the value to the last key
  return obj as Data; // Return the top-level object to allow chaining
}
