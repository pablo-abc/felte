import type { Obj, ValidationFunction, Errors } from '../types';
import { _mergeWith } from './mergeWith';
import { _isPlainObject } from './isPlainObject';

type ErrorField = string | Obj | string[];

function executeCustomizer(objValue?: ErrorField, srcValue?: ErrorField) {
  if (_isPlainObject(objValue) || _isPlainObject(srcValue)) return;
  if (objValue === null) return srcValue;
  if (srcValue === null) return objValue;
  if (!objValue || !srcValue) return;
  if (!Array.isArray(objValue)) objValue = [objValue as string];
  if (!Array.isArray(srcValue)) srcValue = [srcValue as string];
  return [...objValue, ...srcValue];
}

export async function executeValidation<Data extends Obj>(
  values: Data,
  validations?: ValidationFunction<Data>[] | ValidationFunction<Data>
): Promise<ReturnType<ValidationFunction<Data>>> {
  if (!validations) return;
  if (!Array.isArray(validations)) return validations(values);
  const errorArray = await Promise.all(validations.map((v) => v(values)));
  return _mergeWith<Errors<Data>>(...errorArray, executeCustomizer);
}
