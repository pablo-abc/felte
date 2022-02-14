import type {
  Obj,
  AssignableErrors,
  ValidationFunction,
  ExtenderHandler,
  Extender,
} from '@felte/common';
import { _set, CurrentForm } from '@felte/common';
import type { Struct, StructError, Failure } from 'superstruct';

export type ValidatorConfig = {
  struct: Struct<any, any>;
  level?: 'error' | 'warning';
  transform?: (failures: Failure) => string;
  castValues?: boolean;
};

export function validateStruct<Data extends Obj = any>(
  struct: Struct<any, any>,
  transform: (failures: Failure) => string = (failure) => failure.message
): ValidationFunction<Data> {
  function shapeErrors(errors: StructError): AssignableErrors<Data> {
    return errors.failures().reduce((err, value) => {
      return _set(err, value.path.join('.'), transform(value));
    }, {} as AssignableErrors<Data>);
  }
  return function validate(values: Data): AssignableErrors<Data> | undefined {
    try {
      struct.create(values);
    } catch (error) {
      return shapeErrors(error as StructError);
    }
  };
}

// superstruct does not provide a way to get a coerced value
// without applying the validation (and possibly throwing)
// so we catch the error and extract the coerced value
function coerceStruct({ struct }: ValidatorConfig) {
  return (values: unknown) => {
    try {
      return struct.create(values);
    } catch (error) {
      return (error as StructError)
        .failures()
        .reduce(
          (obj: Obj, failure: Failure) =>
            _set(obj, failure.path, failure.value),
          {}
        );
    }
  };
}

export function validator<Data extends Obj = any>({
  struct,
  transform,
  level = 'error',
  castValues,
}: ValidatorConfig): Extender<Data> {
  return function extender<Data extends Obj = Obj>(
    currentForm: CurrentForm<Data>
  ): ExtenderHandler<Data> {
    if (currentForm.stage !== 'SETUP') return {};
    currentForm.addValidator(validateStruct(struct, transform), { level });
    if (!castValues) return {};
    currentForm.addTransformer(coerceStruct({ struct }));
    return {};
  };
}
