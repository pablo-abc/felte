import _cloneDeep from 'lodash/cloneDeep';
import _isPlainObject from 'lodash/isPlainObject';
import _mergeWith from 'lodash/mergeWith';
import { derived, writable } from 'svelte/store';
import { deepSet, deepSome } from '@felte/common';
import type { Errors, FormConfig, Touched, Stores } from '@felte/common';
import { writableDerived } from './writable-derived';

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

  const errors = writableDerived(
    data,
    ($data: Data, set: (values: Errors<Data>) => void) => {
      (async () => {
        let errors: Errors<Data> = {};
        if (config.validate && $data) errors = await config.validate($data);
        set(errors || {});
      })();
    }
  );

  function errorFilterer(errValue?: string, touchValue?: boolean) {
    if (_isPlainObject(errValue)) return;
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
