import type { Obj, DeepSetResult } from '../types';
import { _mapValues } from './mapValues';
import { _isPlainObject } from './isPlainObject';

/**
 * @category Helper
 */
export function deepSet<Data extends Obj, Value>(
  obj: Data,
  value: Value
): DeepSetResult<Data, Value> {
  return _mapValues(obj, (prop) =>
    _isPlainObject(prop) ? deepSet(prop as Obj, value) : value
  ) as DeepSetResult<Data, Value>;
}
