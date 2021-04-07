import type { Obj, FieldValue } from '../types';

/** @ignore */
export function _set<Data extends Obj>(
  obj: Data | undefined,
  path: string,
  value: FieldValue
): Data {
  obj ??= {} as Data;
  const a = path.split('.');
  let o: any = obj;
  while (a.length - 1) {
    const n = a.shift();
    if (!n) continue;
    if (!(n in o)) o[n] = {};
    o = o[n];
  }
  o[a[0]] = value;
  return obj;
}
