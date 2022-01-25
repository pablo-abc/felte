import type {
  Obj,
  ValidationFunction,
  Errors,
  RecursivePartial,
} from '../types';
import { _mergeWith } from './mergeWith';
import { _isPlainObject } from './isPlainObject';

type ErrorField = Obj | string[] | Obj[] | string;

function executeCustomizer(objValue?: ErrorField, srcValue?: ErrorField) {
  if (_isPlainObject(objValue) || _isPlainObject(srcValue)) return;
  if (objValue === null || objValue === '') return srcValue;
  if (srcValue === null || srcValue === '') return objValue;
  if (!srcValue) return objValue;
  if (!objValue || !srcValue) return;
  if (Array.isArray(objValue)) {
    if (!Array.isArray(srcValue)) return [...objValue, srcValue];
    const newErrors: any[] = [];
    for (let i = 0; i < srcValue.length; i++) {
      let obj: any = objValue[i];
      let src: any = srcValue[i];
      if (!_isPlainObject(obj) && !_isPlainObject(src)) {
        if (!Array.isArray(obj)) obj = [obj];
        if (!Array.isArray(src)) src = [src];
        newErrors.push(...obj, ...src);
      } else {
        newErrors.push(mergeErrors([obj ?? {}, src ?? {}] as any));
      }
    }
    return newErrors.filter(Boolean);
  }
  if (!Array.isArray(srcValue)) srcValue = [srcValue];
  return [objValue, ...srcValue]
    .reduce((acc, value) => acc.concat(value as string), [] as string[])
    .filter(Boolean);
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
  shape: Errors<Data>,
  validations?: ValidationFunction<Data>[] | ValidationFunction<Data>
) {
  const errors = await Promise.all(runValidations(values, validations));
  return mergeErrors<Errors<Data>>([shape, ...errors]);
}
