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

function shapeErrors<Data extends Obj>(
  errors: Record<string, string[]>
): Errors<Data> {
  let err: Errors<Data> = {};
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
  ): Promise<Errors<Data> | undefined> {
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
  ): Promise<Errors<Data> | undefined> {
    const results = suite(values);
    if (results.hasWarnings()) {
      return shapeErrors(results.getWarnings());
    }
  };
}

export function validator<Data extends Obj = Obj>(
  currentForm: CurrentForm<Data>
): ExtenderHandler<Data> {
  if (currentForm.stage !== 'SETUP') return {};
  const validateFn = validateSuite<Data>(
    currentForm.config.validateSuite as ReturnType<typeof create>
  );
  const warnFn = warnSuite<Data>(
    currentForm.config.validateSuite as ReturnType<typeof create>
  );
  currentForm.addValidator(validateFn);
  currentForm.addWarnValidator(warnFn);
  return {};
}
