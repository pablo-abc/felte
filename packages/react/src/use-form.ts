import { useRef, useEffect } from 'react';
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
  /** Helper function to touch a specific field. */
  setTouched(pathOrValue: string | Touched<Data>, touched?: boolean): void;
  /** Helper function to set an error to a specific field. */
  setErrors(
    pathOrValue: string | Errors<Data>,
    error?: string | string[]
  ): void;
  /** Helper function to set an warning to a specific field. */
  setWarnings(
    pathOrValue: string | Errors<Data>,
    warning?: string | string[]
  ): void;
  /** Helper function to set the value of a specific field. Set `touch` to `false` if you want to set the value without setting the field to touched. */
  setField(path: string, value?: FieldValue, touch?: boolean): void;
  /** Helper function to set all values of the form. Useful for "initializing" values after the form has loaded. */
  setFields(values: Data): void;
  /** Helper function that validates every fields and touches all of them. It updates the `errors` store. */
  validate(): Promise<Errors<Data> | void>;
  /** Helper function to programatically set the form to a submitting state */
  setIsSubmitting(isSubmitting: boolean): void;
  /** Helper function to programatically set the form to a dirty state */
  setIsDirty(isDirty: boolean): void;
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

function createSetHelper<
  V extends FieldValue | FieldValue[] = any,
  T extends Obj = Obj
>(storeSetter: (updater: (value: T) => T) => void) {
  return function setHelper(pathOrValue: string | T, value?: V) {
    if (typeof pathOrValue === 'string') {
      storeSetter((oldValue) => {
        return _set(oldValue, pathOrValue, value);
      });
    } else {
      storeSetter(() => pathOrValue);
    }
  };
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

  return {
    ...rest,
    data,
    errors,
    setErrors: createSetHelper<string | string[], Errors<Data>>(
      rest.errors.update
    ),
    warnings,
    setWarnings: createSetHelper<string | string[], Errors<Data>>(
      rest.warnings.update
    ),
    touched,
    setTouched: createSetHelper<boolean, Touched<Data>>(rest.touched.update),
    isSubmitting,
    setIsSubmitting: rest.isSubmitting.set,
    isDirty,
    setIsDirty: rest.isDirty.set,
    isValid,
  };
}
