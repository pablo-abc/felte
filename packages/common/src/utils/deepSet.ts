import type { Obj, DeepSetResult } from '../types';
import { _mapValues } from './mapValues';
import { _isPlainObject } from './isPlainObject';

function handleArray<Value>(value: Value) {
  return function (propVal: Obj) {
    if (_isPlainObject(propVal)) {
      const { key, ...field } = deepSet(propVal as Obj, value);
      return field;
    }
    return value;
  };
}

/**
 * @category Helper
 */
export function deepSet<Data extends Obj, Value>(
  obj: Data,
  value: Value
): DeepSetResult<Data, Value> {
  return _mapValues(obj, (prop) =>
    _isPlainObject(prop)
      ? deepSet(prop as Obj, value)
      : Array.isArray(prop)
      ? prop.map(handleArray(value))
      : value
  ) as DeepSetResult<Data, Value>;
}
