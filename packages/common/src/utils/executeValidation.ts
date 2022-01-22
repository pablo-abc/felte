import type {
  Obj,
  ValidationFunction,
  Errors,
  RecursivePartial,
} from '../types';
import { _mergeWith } from './mergeWith';
import { _isPlainObject } from './isPlainObject';
import { deepSet } from './deepSet';

type ErrorField = string | Obj | string[];

function executeCustomizer(objValue?: ErrorField, srcValue?: ErrorField) {
  if (_isPlainObject(objValue) || _isPlainObject(srcValue)) return;
  if (objValue === null || objValue === '') return srcValue;
  if (srcValue === null || srcValue === '') return objValue;
  if (!objValue || !srcValue) return;
  if (!Array.isArray(objValue)) objValue = [objValue as string];
  if (!Array.isArray(srcValue)) srcValue = [srcValue as string];
  return [...objValue, ...srcValue];
}

export function mergeErrors<Data extends Obj>(
  errors: (RecursivePartial<Data> | undefined)[]
) {
  return _mergeWith<Data>(...errors, executeCustomizer);
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
  const merged = mergeErrors<Errors<Data>>(errors);
  return syncFieldArrays(values, merged);
}

function fieldArrayCustomizer(data: any, error: any) {
  if (_isPlainObject(data)) return;
  if (!Array.isArray(data) || !Array.isArray(error)) return error;
  if (data.length === 0) return error;
  if (data.length === error.length) return;
  const newError: any[][] = [];
  for (let i = 0; i < error.length; i++) {
    const value = error[i];
    const index = i % data.length;
    if (isNaN(index) || !value) continue;
    if (!Array.isArray(newError[index])) newError[index] = [];
    newError[index].push(value);
  }
  return newError.map((e) => {
    if (e.every((o) => _isPlainObject(o))) return mergeErrors(e);
    return e;
  });
}

export function syncFieldArrays<Data extends Obj>(
  shape: Data,
  error: Errors<Data>
): Errors<Data> {
  return _mergeWith<Errors<Data>>(
    deepSet(shape, null),
    error,
    fieldArrayCustomizer
  );
}
