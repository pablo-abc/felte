import type {
  Obj,
  Errors,
  ValidationFunction,
  ExtenderHandler,
  CurrentForm,
} from '@felte/common';
import { _update } from '@felte/common';
import type { ZodError, ZodTypeAny } from 'zod';

export type ValidatorConfig = {
  validateSchema: ZodTypeAny;
};

export function validateSchema<Data extends Obj>(
  schema: ZodTypeAny
): ValidationFunction<Data> {
  function shapeErrors(errors: ZodError): Errors<Data> {
    return errors.issues.reduce((err, value) => {
      if (!value.path) return err;
      return _update(
        err,
        value.path.join('.'),
        (currentValue: undefined | string[]) => {
          if (!currentValue || !Array.isArray(currentValue))
            return [value.message];
          return [...currentValue, value.message];
        }
      );
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
  const validate = currentForm.config.validate;
  const validateFn = validateSchema<Data>(
    currentForm.config.validateSchema as ZodTypeAny
  );
  if (validate && Array.isArray(validate))
    currentForm.config.validate = [...validate, validateFn];
  else if (validate) currentForm.config.validate = [validate, validateFn];
  else currentForm.config.validate = [validateFn];
  return {};
}
