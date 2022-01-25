import type {
  Obj,
  ValidationFunction,
  Extender,
  ExtenderHandler,
  AssignableErrors,
} from '@felte/common';
import { _set, CurrentForm } from '@felte/common';
import type { create } from 'vest';

export type ValidatorConfig = {
  suite: ReturnType<typeof create>;
};

function shapeErrors<Data extends Obj>(
  errors: Record<string, string[]>
): AssignableErrors<Data> {
  let err = {} as AssignableErrors<Data>;
  for (const [fieldName, messages] of Object.entries(errors)) {
    err = _set(err, fieldName, messages);
  }
  return err;
}

export function validateSuite<Data extends Obj>(
  suite: ReturnType<typeof create>
): ValidationFunction<Data> {
  return async function validate(
    values: Data
  ): Promise<AssignableErrors<Data> | undefined> {
    const results = suite(values);
    if (results.hasErrors()) {
      return shapeErrors<Data>(results.getErrors());
    }
  };
}

export function warnSuite<Data extends Obj>(
  suite: ReturnType<typeof create>
): ValidationFunction<Data> {
  return async function validate(
    values: Data
  ): Promise<AssignableErrors<Data> | undefined> {
    const results = suite(values);
    if (results.hasWarnings()) {
      return shapeErrors<Data>(results.getWarnings());
    }
  };
}

export function validator<Data extends Obj = Obj>({
  suite,
}: ValidatorConfig): Extender<Data> {
  return function extender(
    currentForm: CurrentForm<Data>
  ): ExtenderHandler<Data> {
    if (currentForm.stage !== 'SETUP') return {};
    const validateFn = validateSuite<Data>(suite);
    const warnFn = warnSuite<Data>(suite);
    currentForm.addValidator(validateFn);
    currentForm.addValidator(warnFn, { level: 'warning' });
    return {};
  };
}
