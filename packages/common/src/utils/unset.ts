import type { Obj } from '../types';

/** @ignore */
export function _unset<Data extends Obj>(
  obj: Data | undefined,
  path: string | string[]
) {
  if (Object(obj) !== obj) return; // When obj is not an object
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
