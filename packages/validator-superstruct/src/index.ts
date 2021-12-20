import type {
  Obj,
  Errors,
  ValidationFunction,
  ExtenderHandler,
  Extender,
} from '@felte/common';
import { _set, CurrentForm } from '@felte/common';
import type { Struct, StructError, Failure } from 'superstruct';

export type ValidatorConfig = {
  validateStruct: Struct<any, any>;
  warnStruct?: Struct<any, any>;
};

export function validateStruct<Data extends Obj>(
  struct: Struct<any, any>,
  transform: (failures: Failure) => string = (failure) => failure.message
): ValidationFunction<Data> {
  function shapeErrors(errors: StructError): Errors<Data> {
    return errors.failures().reduce((err, value) => {
      return _set(err, value.path.join('.'), transform(value));
    }, {});
  }
  return function validate(values: Data): Errors<Data> | undefined {
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
function coerceStruct(config: ValidatorConfig) {
  return (values: Obj) => {
    try {
      return config.validateStruct.create(values);
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

export function createValidator<Data extends Obj = Obj>(
  transform?: (failures: Failure) => string
): Extender<Data> {
  return function validator<Data extends Obj = Obj>(
    currentForm: CurrentForm<Data>
  ): ExtenderHandler<Data> {
    if (currentForm.form) return {};
    const config = currentForm.config as CurrentForm<Data>['config'] &
      ValidatorConfig;
    currentForm.addValidator(validateStruct(config.validateStruct, transform));
    if (config.warnStruct)
      currentForm.addWarnValidator(
        validateStruct(config.warnStruct, transform)
      );
    if (!config.castValues) return {};
    currentForm.addTransformer(coerceStruct(config));
    return {};
  };
}
