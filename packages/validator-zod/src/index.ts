import type { Obj, Errors, FormConfig, ExtenderHandler } from '@felte/common';
import { _set, CurrentForm } from '@felte/common';
import type { ZodError, ZodTypeAny } from 'zod';

export type ValidatorConfig = {
  validateSchema: ZodTypeAny;
};

export function validateSchema<Data extends Obj>(
  schema: ZodTypeAny
): FormConfig<Data>['validate'] {
  function shapeErrors(errors: ZodError): Errors<Data> {
    return errors.errors.reduce((err, value) => {
      if (!value.path) return err;
      return _set(err, value.path.join('.'), value.message);
    }, {});
  }
  return async function validate(
    values: Data
  ): Promise<Errors<Data> | undefined> {
    try {
      await schema.parseAsync(values);
    } catch (error) {
      return shapeErrors(error);
    }
  };
}

export function validator<Data extends Obj = Obj>(
  currentForm: CurrentForm<Data>
): ExtenderHandler<Data> {
  if (currentForm.form) return {};
  currentForm.config.validate = validateSchema(
    currentForm.config.validateSchema as ZodTypeAny
  );
  return {};
}
