import type { Obj, ValidationFunction, Errors } from '../types';
import { _mergeWith } from './mergeWith';
import { _isPlainObject } from './isPlainObject';

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
  errors: (Partial<Errors<Data>> | undefined)[]
) {
  return _mergeWith<Errors<Data>>(...errors, executeCustomizer);
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
): Promise<ReturnType<ValidationFunction<Data>>> {
  const errors = await Promise.all(runValidations(values, validations));
  return mergeErrors(errors);
}
