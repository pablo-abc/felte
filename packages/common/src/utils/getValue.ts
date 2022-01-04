import { _isPlainObject } from './isPlainObject';
import { _get } from './get';

export function getValue<T, R>(
  storeValue: T,
  selectorOrPath?: ((value: T) => R) | string
) {
  if (!_isPlainObject(storeValue) || !selectorOrPath) return storeValue;
  if (typeof selectorOrPath === 'string') {
    return _get(storeValue, selectorOrPath);
  }
  return selectorOrPath(storeValue);
}
