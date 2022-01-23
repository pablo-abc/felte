import type {
  Obj,
  Errors,
  ValidationFunction,
  Extender,
  ExtenderHandler,
} from '@felte/common';
import { _set, CurrentForm } from '@felte/common';
import type { create } from 'vest';

export type ValidatorConfig = {
  suite: ReturnType<typeof create>;
};

function shapeErrors<Data extends Obj>(
  errors: Record<string, string[]>
): Partial<Errors<Data>> {
  let err: Partial<Errors<Data>> = {};
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
  ): Promise<Partial<Errors<Data>> | undefined> {
    const results = suite(values);
    if (results.hasErrors()) {
      return shapeErrors(results.getErrors());
    }
  };
}

export function warnSuite<Data extends Obj>(
  suite: ReturnType<typeof create>
): ValidationFunction<Data> {
  return async function validate(
    values: Data
  ): Promise<Partial<Errors<Data>> | undefined> {
    const results = suite(values);
    if (results.hasWarnings()) {
      return shapeErrors(results.getWarnings());
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
