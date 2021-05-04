import type { Obj, FieldValue } from '../types';
import { _get } from './get';

/** @ignore */
export function _update<Data extends Obj, Value = FieldValue>(
  obj: Data | undefined,
  path: string,
  updater: (value: Value) => Value
) {
  if (Object(obj) !== obj) obj = {} as Data; // When obj is not an object
  // If not yet an array, get the keys from the string-path
  let newPath = path.toString().match(/[^.[\]]+/g) || [];
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
  )[newPath[newPath.length - 1]] = updater(_get(obj as Data, path) as Value); // Finally assign the value to the last key
  return obj as Data; // Return the top-level object to allow chaining
}
