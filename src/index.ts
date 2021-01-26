import { checkPerKey, enUS, esES, deDE, svSE, Schema } from 'bueno';
import { writable, derived, get } from 'svelte/store';
import type { Readable, Writable } from 'svelte/store';

export interface FormConfig<D extends Record<string, unknown>, R = D> {
  initialValues: D;
  bueno?: Schema<D, R>;
  validate?: (values: D) => Errors<D>;
  onSubmit: (values: D) => void;
  locale?: 'enUS' | 'esES' | 'deDE' | 'svSE';
}

export declare type Errors<Values> = {
  [K in keyof Values]?: Values[K] extends any[]
    ? Values[K][number] extends Record<string, unknown>
      ? Errors<Values[K][number]>[] | string | string[]
      : string | string[]
    : Values[K] extends Record<string, unknown>
    ? Errors<Values[K]>
    : string;
};

type Touched<D extends Record<string, unknown>> = {
  [key in keyof D]: boolean;
};

const locales = { enUS, esES, deDE, svSE };

export function createForm<D extends Record<string, unknown>>(
  config: FormConfig<D>
) {
  const initialTouched = Object.keys(config.initialValues).reduce(
    (acc, key) => ({
      ...acc,
      [key]: false,
    }),
    {} as Touched<D>
  );

  const touched = writable(initialTouched);

  const { subscribe, set, update } = writable({ ...config.initialValues });

  function newDataSet(values: D) {
    touched.update((current) => {
      const untouchedKeys = Object.keys(current).filter((key) => !current[key]);
      return untouchedKeys.reduce(
        (acc, key) => ({
          ...acc,
          [key]: values[key] !== config.initialValues[key],
        }),
        current
      );
    });
    return set(values);
  }

  const errors = derived({ subscribe }, ($data) => {
    let errors: Errors<D> = {};
    if (config.validate) errors = config.validate($data);
    if (config.bueno) {
      errors = checkPerKey<D, D>(
        { ...$data },
        config.bueno,
        locales[config.locale || 'enUS']
      );
    }
    return errors;
  });

  const { subscribe: errorSubscribe } = derived(
    [errors, touched],
    ([$errors, $touched]) => {
      return Object.keys($errors).reduce(
        (acc, key) => ({
          ...acc,
          ...($touched[key] && { [key]: $errors[key] }),
        }),
        {} as Errors<D>
      );
    }
  );

  const isValid = derived([errors, touched], ([$errors, $touched]) => {
    if (!config.validate && !config.bueno) return true;
    const formTouched = Object.keys($touched).some((key) => $touched[key]);
    const hasErrors = Object.keys($errors).some((key) => !!$errors[key]);
    if (!formTouched || hasErrors) return false;
    return true;
  });

  function handleSubmit(event: Event) {
    event.preventDefault();
    touched.update((t) => {
      return Object.keys(t).reduce(
        (acc, key) => ({
          ...acc,
          [key]: true,
        }),
        t
      );
    });
    if (Object.keys(get(errors)).length !== 0) return;
    config.onSubmit(get({ subscribe }));
  }
  return {
    data: { subscribe, set: newDataSet, update } as Writable<D>,
    errors: { subscribe: errorSubscribe } as Readable<Errors<D>>,
    touched,
    handleSubmit,
    isValid,
  };
}
