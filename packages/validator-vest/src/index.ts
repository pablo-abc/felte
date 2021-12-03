import type {
  Obj,
  Errors,
  ValidationFunction,
  ExtenderHandler,
} from '@felte/common';
import { _set, CurrentForm } from '@felte/common';
import type { create } from 'vest';

export type ValidatorConfig = {
  validateSuite: ReturnType<typeof create>;
};

export function validateSuite<Data extends Obj>(
  suite: ReturnType<typeof create>
): ValidationFunction<Data> {
  function shapeErrors(errors: Record<string, string[]>): Errors<Data> {
    let err: Errors<Data> = {};
    for (const [fieldName, messages] of Object.entries(errors)) {
      err = _set(err, fieldName, messages);
    }
    return err;
  }

  return async function validate(
    values: Data
  ): Promise<Errors<Data> | undefined> {
    const results = suite(values);
    if (results.hasErrors()) {
      return shapeErrors(results.getErrors());
    }
  };
}

export function validator<Data extends Obj = Obj>(
  currentForm: CurrentForm<Data>
): ExtenderHandler<Data> {
  if (currentForm.form) return {};
  const validateFn = validateSuite<Data>(
    currentForm.config.validateSuite as ReturnType<typeof create>
  );
  currentForm.addValidator(validateFn);
  return {};
}
