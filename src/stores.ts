import { derived, writable } from 'svelte/store';
import type { Errors, Form, FormConfig, Touched } from './types';

type Stores<D extends Record<string, unknown>> = Omit<
  Form<D>,
  'handleSubmit' | 'form'
>;

export function createStores<D extends Record<string, unknown>>(
  config: FormConfig<D>
): Stores<D> {
  const initialTouched = Object.keys(config.initialValues || {}).reduce(
    (acc, key) => ({
      ...acc,
      [key]: false,
    }),
    {} as Touched<D>
  );

  const touched = writable(initialTouched);

  const data = writable(
    config.initialValues ? { ...config.initialValues } : undefined
  );

  const errors = derived(data, ($data: D, set: (values: Errors<D>) => void) => {
    (async () => {
      let errors: Errors<D> = {};
      if (config.validate) errors = await config.validate($data);
      set(errors);
    })();
  });

  const { subscribe: errorSubscribe } = derived(
    [errors, touched],
    ([$errors, $touched]) => {
      return Object.keys($errors || {}).reduce(
        (acc, key) => ({
          ...acc,
          ...($touched[key] && { [key]: $errors[key] }),
        }),
        {} as Errors<D>
      );
    }
  );

  const isValid = derived([errors, touched], ([$errors, $touched]) => {
    if (!config.validate) return true;
    const formTouched = Object.keys($touched).some((key) => $touched[key]);
    const hasErrors = Object.keys($errors).some((key) => !!$errors[key]);
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
