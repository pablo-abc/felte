import type { Obj, FieldValue } from '../types';

/** @ignore */
export function _get<Data extends Obj, Default = undefined>(
  obj: Data,
  path: string,
  defaultValue?: Default
): FieldValue | FieldValue[] | Default | undefined {
  const keys = path.split('.');
  let value: any = obj;
  try {
    for (const key of keys) {
      value = value[key];
    }
  } catch {
    return defaultValue;
  }
  return typeof value === 'undefined' ? defaultValue : value;
}
