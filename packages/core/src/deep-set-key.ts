import type { Obj, Keyed } from '@felte/common';
import { _mapValues, _isPlainObject, createId } from '@felte/common';

export function deepSetKey<Data extends Obj>(obj?: Data): Data {
  if (!obj) return {} as Data;
  return _mapValues(obj, (prop) => {
    if (_isPlainObject(prop)) return deepSetKey(prop as Obj);
    if (Array.isArray(prop)) {
      if (prop.length === 0 || prop.every((p) => typeof p === 'string'))
        return prop;
      return prop.map((p) => {
        if (!_isPlainObject(p)) return p;
        const field = deepSetKey(p as Obj);
        if (!field.key) field.key = createId();
        return field;
      });
    }
    return prop;
  }) as Data;
}

export function deepRemoveKey<Data extends Obj>(
  obj?: Keyed<Data> | Data
): Data {
  if (!obj) return {} as Data;
  return _mapValues(obj, (prop) => {
    if (_isPlainObject(prop)) return deepSetKey(prop as Obj);
    if (Array.isArray(prop)) {
      if (prop.length === 0 || prop.every((p) => typeof p === 'string'))
        return prop;
      return prop.map((p) => {
        if (!_isPlainObject(p)) return p;
        const { key, ...field } = deepSetKey(p as Obj);
        return field;
      });
    }
    return prop;
  }) as Data;
}
