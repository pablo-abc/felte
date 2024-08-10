import type {
  Obj,
  AssignableErrors,
  ValidationFunction,
  ExtenderHandler,
  CurrentForm,
  Extender,
} from '@felte/common';
import { _update } from '@felte/common';
import type { ZodError, AnyZodObject, ParseParams } from 'zod';

type ZodSchema = {
  parseAsync: AnyZodObject['parseAsync'];
};

export type ValidatorConfig = {
  schema: ZodSchema;
  level?: 'error' | 'warning';
  params?: Partial<ParseParams>;
};

export function validateSchema<Data extends Obj>(
  schema: ZodSchema,
  params?: Partial<ParseParams>
): ValidationFunction<Data> {
  function shapeErrors(errors: ZodError): AssignableErrors<Data> {
    return errors.issues.reduce((err, value) => {
      /* istanbul ignore next */
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
    }, {} as AssignableErrors<Data>);
  }
  return async function validate(
    values: Data
  ): Promise<AssignableErrors<Data> | undefined> {
    try {
      await schema.parseAsync(values, params);
    } catch (error) {
      return shapeErrors(error as ZodError<any>);
    }
  };
}

export function validator<Data extends Obj = Obj>({
  schema,
  level = 'error',
  params,
}: ValidatorConfig): Extender<Data> {
  return function extender(
    currentForm: CurrentForm<Data>
  ): ExtenderHandler<Data> {
    if (currentForm.stage !== 'SETUP') return {};
    const validateFn = validateSchema<Data>(schema, params);
    currentForm.addValidator(validateFn, { level });
    return {};
  };
}
