import _mapValues from 'lodash/mapValues';
import _isPlainObject from 'lodash/isPlainObject';
import _some from 'lodash/some';
import type { Errors } from './types';

type Obj = Record<string, unknown>;

type DeepSetResult<Data extends Obj, Value> = {
  [key in keyof Data]: Data[key] extends Obj
    ? DeepSetResult<Data[key], Value>
    : Value;
};

export function deepSet<Data extends Obj, Value>(
  obj: Data,
  value: Value
): DeepSetResult<Data, Value> {
  return _mapValues(obj, (prop) =>
    _isPlainObject(prop) ? deepSet(prop as Obj, value) : value
  ) as DeepSetResult<Data, Value>;
}

export function deepSome(obj: Obj, pred: (value: unknown) => boolean): boolean {
  return _some(obj, (value) =>
    _isPlainObject(value) ? deepSome(value as Obj, pred) : pred(value)
  );
}

export function hasSomeErrors<Data extends Obj>(errors: Errors<Data>): boolean {
  return _some(errors, (value) =>
    _isPlainObject(value) ? hasSomeErrors(value as Obj) : !!value
  );
}
