import { derived, writable } from 'svelte/store';
import {
  deepSet,
  deepSome,
  executeValidation,
  _cloneDeep,
  _isPlainObject,
  _mergeWith,
} from '@felte/common';
import type { Errors, FormConfig, Touched, Stores } from '@felte/common';

export function createStores<Data extends Record<string, unknown>>(
  config: FormConfig<Data>
): Stores<Data> {
  const initialTouched: Touched<Data> = deepSet<Data, boolean>(
    config.initialValues || ({} as Data),
    false
  );

  const touched = writable(initialTouched);

  const data = writable(
    config.initialValues ? _cloneDeep(config.initialValues) : ({} as Data)
  );

  const errors = writable(
    {} as Errors<Data>,
    (set: (values: Errors<Data>) => void) => {
      async function validate($data?: Data) {
        let errors: Errors<Data> | undefined = {};
        if (!config.validate || !$data) return;
        errors = await executeValidation($data, config.validate);
        set(errors || {});
      }
      return data.subscribe(validate);
    }
  );

  function errorFilterer(errValue?: string, touchValue?: boolean) {
    if (_isPlainObject(touchValue)) return;
    return (touchValue && errValue) || null;
  }

  const { subscribe: errorSubscribe } = derived(
    [errors, touched],
    ([$errors, $touched]) => {
      return _mergeWith<Errors<Data>>($errors, $touched, errorFilterer);
    }
  );

  let firstCalled = false;
  const isValid = derived(errors, ($errors) => {
    if (!config.validate) return true;
    if (!firstCalled) {
      firstCalled = true;
      return false;
    }
    const hasErrors = deepSome($errors, (error) => !!error);
    return !hasErrors;
  });

  const isSubmitting = writable(false);

  return {
    touched,
    isSubmitting,
    isValid,
    errors: {
      subscribe: errorSubscribe,
      set: errors.set,
      update: errors.update,
    },
    data,
  };
}
