import type {
  Obj,
  ValidationFunction,
  Errors,
  RecursivePartial,
} from '../types';
import { _mergeWith } from './mergeWith';
import { _isPlainObject } from './isPlainObject';
import { deepSet } from './deepSet';

type ErrorField = Obj | string[] | Obj[] | string;

function executeCustomizer(objValue?: ErrorField, srcValue?: ErrorField) {
  if (_isPlainObject(objValue) || _isPlainObject(srcValue)) return;
  if (objValue === null || objValue === '') return srcValue;
  if (srcValue === null || srcValue === '') return objValue;
  if (!objValue || !srcValue) return;
  if (Array.isArray(srcValue) && Array.isArray(objValue)) {
    const newErrors: any[] = [];
    for (let i = 0; i < srcValue.length; i++) {
      const src = srcValue[i];
      const obj = objValue[i];
      const err =
        !_isPlainObject(obj) && !_isPlainObject(src)
          ? [obj, src].filter((v) => v && !Array.isArray(v))
          : mergeErrors([obj ?? {}, src ?? {}] as any);
      newErrors.push(err);
    }
    return newErrors;
  }
  if (!Array.isArray(objValue)) objValue = [objValue];
  if (!Array.isArray(srcValue)) srcValue = [srcValue];
  return [...objValue, ...srcValue].filter((v) => v && !Array.isArray(v));
}

export function mergeErrors<Data extends Obj>(
  errors: (RecursivePartial<Data> | undefined)[]
) {
  const merged = _mergeWith<Data>(...errors, executeCustomizer);
  return merged;
}

export function runValidations<Data extends Obj>(
  values: Data,
  validationOrValidations?:
    | ValidationFunction<Data>[]
    | ValidationFunction<Data>
): ReturnType<ValidationFunction<Data>>[] {
  if (!validationOrValidations) return [];
  const validations = Array.isArray(validationOrValidations)
    ? validationOrValidations
    : [validationOrValidations];

  return validations.map((v) => v(values));
}

export async function executeValidation<Data extends Obj>(
  values: Data,
  validations?: ValidationFunction<Data>[] | ValidationFunction<Data>
) {
  const errors = await Promise.all(runValidations(values, validations));
  return mergeErrors<Errors<Data>>([
    deepSet(values, []) as Errors<Data>,
    ...errors,
  ]);
}
