import type { Obj, Touched, Keyed } from '@felte/common';
import { _mapValues, _isPlainObject } from '@felte/common';

export function deepSetTouched<Data extends Obj>(
  obj: Data | Keyed<Data>,
  value: boolean
): Touched<Data> {
  return _mapValues(obj, (prop) => {
    if (_isPlainObject(prop)) return deepSetTouched(prop as Obj, value);
    if (Array.isArray(prop)) {
      if (prop.length === 0 || prop.every((p) => typeof p === 'string'))
        return value;
      return prop.map((p) => {
        const { key, ...field } = deepSetTouched(p as Obj, value);
        return field;
      });
    }
    return value;
  }) as Touched<Data>;
}
