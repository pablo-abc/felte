import type { Obj, TransformFunction } from '../types';

export function executeTransforms<Data extends Obj>(
  values: Obj,
  transforms?: TransformFunction<Data>[] | TransformFunction<Data>
): ReturnType<TransformFunction<Data>> {
  if (!transforms) return values as Data;
  if (!Array.isArray(transforms)) return transforms(values);
  return transforms.reduce((res, t) => t(res), values) as Data;
}
