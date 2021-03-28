import _cloneDeep from 'lodash-es/cloneDeep';
import _isPlainObject from 'lodash-es/isPlainObject';
import _mergeWith from 'lodash-es/mergeWith';
import { derived, writable } from 'svelte/store';
import { deepSet, deepSome, executeValidation } from '@felte/common';
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
    config.initialValues ? _cloneDeep(config.initialValues) : undefined
  );

  const errors = writable(
    {} as Errors<Data>,
    (set: (values: Errors<Data>) => void) => {
      return data.subscribe(async ($data) => {
        let errors: Errors<Data> | undefined = {};
        if (!config.validate || !$data) return;
        errors = await executeValidation($data, config.validate);
        set(errors || {});
      });
    }
  );

  function errorFilterer(errValue?: string, touchValue?: boolean) {
    if (_isPlainObject(touchValue)) return;
    return (touchValue && errValue) || null;
  }

  const { subscribe: errorSubscribe } = derived(
    [errors, touched],
    ([$errors, $touched]) => {
      return _mergeWith(_cloneDeep($errors), $touched, errorFilterer);
    }
  );

  const isValid = derived([errors, touched], ([$errors, $touched]) => {
    if (!config.validate) return true;
    const formTouched = deepSome($touched, (touch) => !!touch);
    const hasErrors = deepSome($errors, (error) => !!error);
    if (!formTouched || hasErrors) return false;
    return true;
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
