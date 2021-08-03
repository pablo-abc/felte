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
};

export function validateStruct<Data extends Obj>(
  struct: Struct<any, any>,
  transform: (failures: Failure) => string = (failure) => failure.message
): ValidationFunction<Data> {
  function shapeErrors(errors: StructError): Errors<Data> {
    return errors.failures().reduce((err, value) => {
      if (!value.path) return err;
      return _set(err, value.path.join('.'), transform(value));
    }, {});
  }
  return function validate(values: Data): Errors<Data> | undefined {
    try {
      struct.assert(values);
    } catch (error) {
      return shapeErrors(error);
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
    const validateFn = validateStruct<Data>(
      currentForm.config.validateStruct as Struct<any, any>,
      transform
    );
    currentForm.addValidator(validateFn);
    return {};
  };
}
