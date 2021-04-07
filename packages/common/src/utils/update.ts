import type { Obj, FieldValue } from '../types';

/** @ignore */
export function _update<Data extends Obj, Value = FieldValue>(
  obj: Data,
  path: string,
  updater: (value: Value) => Value
): Data {
  const a = path.split('.');
  let o: any = obj;
  while (a.length - 1) {
    const n = a.shift();
    if (!n) continue;
    if (!(n in o)) o[n] = {};
    o = o[n];
  }
  o[a[0]] = updater(o[a[0]]);
  return obj;
}
