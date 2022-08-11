import type { Obj } from '../types';

/** @ignore */
export function _mapValues(
  obj: Obj,
  updater: (value: unknown) => unknown
): Obj {
  const keys = Object.keys(obj || {});
  return keys.reduce(
    (acc: Obj, key: string) => ({
      ...acc,
      [key]: updater(obj[key]),
    }),
    {}
  );
}
