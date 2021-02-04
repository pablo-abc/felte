import { derived, writable } from 'svelte/store';
import type { Errors, Form, FormConfig, Touched } from './types';
import _cloneDeep from 'lodash/cloneDeep';
import _mergeWith from 'lodash/mergeWith';
import { deepSet, deepSome } from './helpers';
import produce from 'immer';

type Stores<Data extends Record<string, unknown>> = Omit<
  Form<Data>,
  'handleSubmit' | 'form'
>;

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

  const errors = derived(
    data,
    ($data: Data, set: (values: Errors<Data>) => void) => {
      (async () => {
        let errors: Errors<Data> = {};
        if (config.validate && $data) errors = await config.validate($data);
        set(errors);
      })();
    }
  );

  function errorFilterer(errValue?: string, touchValue?: boolean) {
    return (touchValue && errValue) || null;
  }

  const { subscribe: errorSubscribe } = derived(
    [errors, touched],
    ([$errors, $touched]) => {
      return produce($errors, (draft) =>
        _mergeWith(draft, $touched, errorFilterer)
      );
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
    errors: { subscribe: errorSubscribe },
    data,
  };
}
