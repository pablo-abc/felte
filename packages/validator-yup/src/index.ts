import type { AnySchema, ValidationError } from 'yup';
import type { ValidateOptions } from 'yup/lib/types';
import type { Obj, Errors, FormConfig } from '@felte/common';
import { _set } from '@felte/common';

export function validateSchema<Data extends Obj>(
  schema: AnySchema,
  options?: ValidateOptions
): FormConfig<Data>['validate'] {
  function shapeErrors(errors: ValidationError): Errors<Data> {
    return errors.inner.reduce((err, value) => {
      if (!value.path) return err;
      return _set(err, value.path, value.message);
    }, {});
  }
  return async function validate(
    values: Data
  ): Promise<Errors<Data> | undefined> {
    return schema
      .validate(values, { abortEarly: false, ...options })
      .then(() => undefined)
      .catch(shapeErrors);
  };
}
