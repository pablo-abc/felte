import type { Obj, FieldValue } from '../types';

/* From: https://github.com/you-dont-need/You-Dont-Need-Lodash-Underscore#_get */

/** @ignore */
export function _get<Data extends Obj, Default = undefined>(
  obj: Data,
  path: string,
  defaultValue?: Default
): Default | FieldValue | FieldValue[] {
  const travel = (regexp: RegExp) =>
    String.prototype.split
      .call(path, regexp)
      .filter(Boolean)
      .reduce(
        (res: any, key) => (res !== null && res !== undefined ? res[key] : res),
        obj
      );
  const result = travel(/[,[\]]+?/) || travel(/[,[\].]+?/);
  return result === undefined || result === obj ? defaultValue : result;
}
