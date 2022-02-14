import type { Obj } from '../types';
import { _some } from './some';
import { _isPlainObject } from './isPlainObject';

/**
 * @category Helper
 */
export function deepSome(obj: Obj, pred: (value: unknown) => boolean): boolean {
  return _some(obj, (value) =>
    _isPlainObject(value)
      ? deepSome(value as Obj, pred)
      : Array.isArray(value)
      ? value.length === 0 || value.every((v) => typeof v === 'string')
        ? pred(value)
        : value.some((v) =>
            _isPlainObject(v) ? deepSome(v as Obj, pred) : pred(v)
          )
      : pred(value)
  );
}
