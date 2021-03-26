import type { AnySchema, ValidationError } from 'yup';
import type { ValidateOptions } from 'yup/lib/types';
import type { Obj, Errors, FormConfig, ExtenderHandler } from '@felte/common';
import { _set, CurrentForm } from '@felte/common';

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

export function validator<Data extends Obj = Obj>(
  currentForm: CurrentForm<Data>
): ExtenderHandler<Data> {
  if (currentForm.form) return {};
  currentForm.config.validate = validateSchema(
    currentForm.config.validateSchema as AnySchema
  );
  return {};
}
