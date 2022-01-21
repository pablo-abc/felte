import type { Paths, Traverse, Obj, FieldValue } from '../types';
import { _isPlainObject } from './isPlainObject';
import { _get } from './get';

export function getValue<T>(storeValue: T): T;
export function getValue<T extends Obj, R>(
  storeValue: T,
  selector: (value: T) => R
): R;
export function getValue<T extends Obj, P extends Paths<T> = Paths<T>>(
  storeValue: T,
  path: P
): Traverse<T, P>;
export function getValue<T>(
  storeValue: T,
  selectorOrPath: string | ((value: any) => any)
): T;
export function getValue<T, R>(
  storeValue: T,
  selectorOrPath?: ((value: T) => R) | string
): T | R | FieldValue | FieldValue[] | undefined {
  if (!_isPlainObject(storeValue) || !selectorOrPath) return storeValue;
  if (typeof selectorOrPath === 'string') {
    return _get(storeValue, selectorOrPath);
  }
  return selectorOrPath(storeValue);
}
