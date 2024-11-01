import type {
  Obj,
  AssignableErrors,
  ValidationFunction,
  ExtenderHandler,
  CurrentForm,
  Extender,
} from '@felte/common';
import { _update } from '@felte/common';
import type { ZodError, ZodSchema } from 'zod';

export type ValidatorConfig<Data extends Obj = Obj> = {
  schema: ZodSchema<Data>;
  level?: 'error' | 'warning';
};

export function validateSchema<Data extends Obj>(
  schema: ZodSchema
): ValidationFunction<Data> {
  function walk(
    error: ZodError,
    err: AssignableErrors<Data>
  ): AssignableErrors<Data> {
    for (const issue of error.issues) {
      if (issue.code === 'invalid_union') {
        for (const unionError of issue.unionErrors) {
          err = walk(unionError, err);
        }
      } else {
        if (!issue.path) continue;

        const updater = (currentValue?: string[]) => {
          if (!currentValue || !Array.isArray(currentValue)) {
            return [issue.message];
          }
          return [...currentValue, issue.message];
        };
        err = _update(err, issue.path.join('.'), updater);
      }
    }

    return err;
  }

  return async function validate(
    values: Data
  ): Promise<AssignableErrors<Data> | undefined> {
    const result = await schema.safeParseAsync(values);
    if (!result.success) {
      let err = {} as AssignableErrors<Data>;
      err = walk(result.error, err);
      return err;
    }
  };
}

export function validator<Data extends Obj = Obj>({
  schema,
  level = 'error',
}: ValidatorConfig): Extender<Data> {
  return function extender(
    currentForm: CurrentForm<Data>
  ): ExtenderHandler<Data> {
    if (currentForm.stage !== 'SETUP') return {};
    const validateFn = validateSchema<Data>(schema);
    currentForm.addValidator(validateFn, { level });
    return {};
  };
}
