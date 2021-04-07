import type { Obj } from '../types';
import { _mergeWith } from './mergeWith';

/** @ignore */
export function _merge<T extends Obj>(...args: any[]): T {
  return _mergeWith(...args, () => undefined);
}
