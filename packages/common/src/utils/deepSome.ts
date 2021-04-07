import type { Obj } from '../types';
import { _some } from './some';
import { _isPlainObject } from './isPlainObject';

/**
 * @category Helper
 */
export function deepSome(obj: Obj, pred: (value: unknown) => boolean): boolean {
  return _some(obj, (value) =>
    _isPlainObject(value) ? deepSome(value as Obj, pred) : pred(value)
  );
}
