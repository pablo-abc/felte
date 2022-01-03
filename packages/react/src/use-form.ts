import { useRef, useEffect, useCallback } from 'react';
import type {
  FormConfig,
  Obj,
  Errors,
  Touched,
  CreateSubmitHandlerConfig,
  FieldValue,
  FormConfigWithInitialValues,
  FormConfigWithoutInitialValues,
} from '@felte/core';
import {
  createForm as coreCreateForm,
  _get,
  _set,
  _isPlainObject,
} from '@felte/core';
import { writable } from 'svelte/store';
import type { Stores } from './use-accessor';
import { useAccessor } from './use-accessor';

type Setter<Data, Value> = Data extends Obj
  ? ((path: string, value: Value) => void) &
      ((path: string, updater: (value: Value) => Value) => void) &
      ((value: Data) => void) &
      ((updater: (value: Data) => Data) => void)
  : ((value: Data) => void) &
      ((path: string, value: Value) => void) &
      ((path: string, updater: (value: Value) => Value) => void);

/** The return type for the `createForm` function. */
export type Form<Data extends Obj> = {
  /** Action function to be used with the `use` directive on your `form` elements. */
  form(node: HTMLFormElement): void;
  /** Function to handle submit to be passed to the on:submit event. Not necessary if using the `form` action. */
  handleSubmit(e?: Event): void;
  /** Function that creates a submit handler. If a function is passed as first argument it overrides the default `onSubmit` function set in the `createForm` config object. */
  createSubmitHandler(
    altConfig?: CreateSubmitHandlerConfig<Data>
  ): (e?: Event) => void;
  /** Function that resets the form to its initial values */
  reset(): void;
  /** Helper function to set the value of a specific field without updating the DOM. */
  setData: Setter<Data, FieldValue | FieldValue[]>;
  /** Helper function to touch a specific field. */
  setTouched: Setter<Touched<Data>, boolean>;
  /** Helper function to set an error to a specific field. */
  setErrors: Setter<Errors<Data>, string | string[]>;
  /** Helper function to set an warning to a specific field. */
  setWarnings: Setter<Errors<Data>, string | string[]>;
  /** Helper function to set the value of a specific field. Set `touch` to `false` if you want to set the value without setting the field to touched. */
  setField(path: string, value?: FieldValue, touch?: boolean): void;
  /** Helper function to set all values of the form. Useful for "initializing" values after the form has loaded. */
  setFields(values: Data): void;
  /** Helper function that validates every fields and touches all of them. It updates the `errors` store. */
  validate(): Promise<Errors<Data> | void>;
  /** Helper function to programatically set the form to a submitting state */
  setIsSubmitting: Setter<boolean, boolean>;
  /** Helper function to programatically set the form to a dirty state */
  setIsDirty: Setter<boolean, boolean>;
  /** Helper function to re-set the initialValues of Felte. No reactivity will be triggered but this will be the data the form will be reset to when caling `reset`. */
  setInitialValues: (values: Data) => void;
} & Stores<Data>;

function useConst<T>(setup: () => T): T {
  const ref = useRef<T>();
  if (ref.current === undefined) {
    ref.current = setup();
  }
  return ref.current;
}

function isUpdater<T>(value: unknown): value is (value: T) => T {
  return typeof value === 'function';
}

function useSetHelper<
  V extends FieldValue | FieldValue[],
  T extends Obj | boolean
>(storeSetter: (updater: (value: T) => T) => void): Setter<T, V> {
  const setHelper = useCallback(
    (
      pathOrValue: string | T | ((value: T) => T),
      valueOrUpdater?: V | ((value: V) => V)
    ) => {
      if (typeof pathOrValue === 'string') {
        const path = pathOrValue;
        storeSetter((oldValue) => {
          if (!_isPlainObject(oldValue)) return oldValue;
          const newValue = isUpdater<V>(valueOrUpdater)
            ? valueOrUpdater(_get(oldValue, path) as V)
            : valueOrUpdater;
          return _set(oldValue, path, newValue);
        });
      } else {
        storeSetter((oldValue) =>
          isUpdater<T>(pathOrValue) ? pathOrValue(oldValue) : pathOrValue
        );
      }
    },
    []
  );

  return setHelper as Setter<T, V>;
}

export function useForm<Data extends Obj = Obj, Ext extends Obj = Obj>(
  config: FormConfigWithInitialValues<Data> & Ext
): Form<Data>;
/**
 * Creates the stores and `form` action to make the form reactive.
 * In order to use auto-subscriptions with the stores, call this function at the top-level scope of the component.
 *
 * @param config - Configuration for the form itself. Since `initialValues` is not set (when only using the `form` action), `Data` will be undefined until the `form` element loads.
 */
export function useForm<Data extends Obj = Obj, Ext extends Obj = Obj>(
  config: FormConfigWithoutInitialValues<Data> & Ext
): Form<Data>;
export function useForm<Data extends Obj = Obj>(
  config: FormConfig<Data>
): Form<Data> {
  const destroyRef = useRef<() => void>();

  const { cleanup, ...rest } = useConst(() => {
    const { form: coreForm, ...rest } = coreCreateForm(config, {
      storeFactory: writable,
    });
    const form = (node?: HTMLFormElement) => {
      if (!node) return;
      const { destroy } = coreForm(node);
      destroyRef.current = destroy;
    };
    return { form, ...rest };
  });

  const data = useAccessor(rest.data);
  const errors = useAccessor(rest.errors);
  const touched = useAccessor(rest.touched);
  const warnings = useAccessor(rest.warnings);
  const isSubmitting = useAccessor(rest.isSubmitting);
  const isDirty = useAccessor(rest.isDirty);
  const isValid = useAccessor(rest.isValid);

  useEffect(() => {
    return () => {
      cleanup();
      destroyRef.current?.();
    };
  }, []);

  const setData = useSetHelper<FieldValue | FieldValue[], Data>(
    rest.data.update
  );
  const setErrors = useSetHelper<string | string[], Errors<Data>>(
    rest.errors.update
  );
  const setWarnings = useSetHelper<string | string[], Errors<Data>>(
    rest.warnings.update
  );
  const setTouched = useSetHelper<boolean, Touched<Data>>(rest.touched.update);
  const setIsSubmitting = useSetHelper<boolean, boolean>(
    rest.isSubmitting.update
  );
  const setIsDirty = useSetHelper<boolean, boolean>(rest.isDirty.update);

  return {
    ...rest,
    data,
    setData,
    errors,
    setErrors,
    warnings,
    setWarnings,
    touched,
    setTouched,
    isSubmitting,
    setIsSubmitting,
    isDirty,
    setIsDirty,
    isValid,
  };
}
