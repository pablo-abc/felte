import type { Obj } from '../types';

/** @ignore */
export function _unset<Data extends Obj>(obj: Data, path: string): Data {
  const a = path.split('.');
  let o: any = obj;
  while (a.length - 1) {
    const n = a.shift();
    if (!n) continue;
    if (!(n in o)) o[n] = {};
    o = o[n];
  }
  delete o[a[0]];
  return obj;
}
