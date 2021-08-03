import type {
  Errors,
  ValidationFunction,
  ExtenderHandler,
  CurrentForm,
} from '@felte/common';
import { getPath } from '@felte/common';

export type ValidatorConfig = {
  controls?: Record<string, (state: ValidityState) => string | string>
  defaults?: Record<keyof ValidityState, string>,
};

export const validator = (options?: ValidatorConfig) => (
  currentForm: CurrentForm<Record<string, string>>
): ExtenderHandler<Record<string, string>> => {
  // Check if the current HTMLFormElement is supplied and if the validator isn't set up yet
  if (currentForm.form && currentForm.config.cvapivalidation !== true) {
    const cvapiValidatorFn: ValidationFunction<Record<string, string>> = () => {
      const cvErrors: Errors<Record<string, string>> = {};

      if (currentForm.form && currentForm.controls) {
        // enable native form-validation
        currentForm.form.novalidate = false;

        // iterate over each field
        currentForm.controls.forEach((control) => {
          // get its path
          const path = getPath(control);

          // if the field is invalid
          if (control.validity.valid === false) {
            // check if there is an error-message for that control in the supplied config
            if (options?.controls?.[path]) {
              // if yes, check if its a function
              if (typeof options.controls[path] === 'function') {
                // if yes, call the function and set the error-msg
                cvErrors[path] = options.controls[path](control.validity);
              } else {
                // if not, it has to be a string, set the error-msg
                // @ts-expect-error TS is yelling at me besides of the type-guard. Not sure why. Somethings fishy with the type-inference.
                cvErrors[path] = options.controls[path];
              }
            // if not, check if default error-msgs are supplied.
            } else if (options?.defaults) {
              // if yes, try to find the first matching supplied msg for an error-category which is set to true in validity-state
              cvErrors[path] = Object.keys(control.validity).find(key => options?.defaults?.[key as keyof ValidityState]);
            }

            // if no supplied error-msg could be found, fall back to the browser-supplied default
            if (!cvErrors[path]) {
              cvErrors[path] = control.validationMessage;
            }
          } else {
            // if the field is valid, use the default, browser-supplied msg, which should be empty and reset the error-renderer
            cvErrors[path] = control.validationMessage;
          }
        });

        // disable native form-validation to suppress the native "error-bubbles".
        currentForm.form.novalidate = true;
      }

      return cvErrors;
    };

    const validate = currentForm.config.validate;

    if (validate && Array.isArray(validate)) {
      currentForm.config.validate = [...validate, cvapiValidatorFn];
    } else if (validate) {
      currentForm.config.validate = [validate, cvapiValidatorFn];
    } else {
      currentForm.config.validate = [cvapiValidatorFn];
    }

    currentForm.config.cvapivalidation = true;
  }

  return {};
};
