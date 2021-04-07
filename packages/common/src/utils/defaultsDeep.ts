import type { Obj } from '../types';
import { _isPlainObject } from './isPlainObject';
import { _mergeWith } from './mergeWith';

function defaultsCustomizer(objValue: any, srcValue: any) {
  if (_isPlainObject(objValue) && _isPlainObject(srcValue)) return;
  if (typeof objValue !== 'undefined') return objValue;
}

/** @ignore */
export function _defaultsDeep<T extends Obj>(...args: any[]): T {
  return _mergeWith(...args, defaultsCustomizer);
}
