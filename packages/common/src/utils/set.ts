import type { Obj } from '../types';
import { _update } from './update';

/** @ignore */
export function _set<Data extends Obj>(
  obj: Data | undefined,
  path: string | string[],
  value: any
) {
  return _update(obj, path, () => value);
}
