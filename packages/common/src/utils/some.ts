import type { Obj } from '../types';

/** @ignore */
export function _some(obj: Obj, pred: (value: unknown) => boolean): boolean {
  const keys = Object.keys(obj);
  return keys.some((key) => pred(obj[key]));
}
