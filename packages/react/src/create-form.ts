import { useRef, useEffect, useState } from 'react';
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
import { createForm as coreCreateForm, deepSet, _set } from '@felte/core';
import { writable } from 'svelte/store';

export type Stores<Data extends Obj> = {
  data: Data;
  errors: Errors<Data>;
  warnings: Errors<Data>;
  touched: Touched<Data>;
  isSubmitting: boolean;
  isValid: boolean;
  isDirty: boolean;
};

/** The return type for the `createForm` function. */
export type Form<Data extends Obj> = {
  /** Action function to be used with the `use` directive on your `form` elements. */
  formRef(node: HTMLFormElement): void;
  /** Function to handle submit to be passed to the on:submit event. Not necessary if using the `form` action. */
  handleSubmit(e?: Event): void;
  /** Function that creates a submit handler. If a function is passed as first argument it overrides the default `onSubmit` function set in the `createForm` config object. */
  createSubmitHandler(
    altConfig?: CreateSubmitHandlerConfig<Data>
  ): (e?: Event) => void;
  /** Function that resets the form to its initial values */
  reset(): void;
  /** Helper function to touch a specific field. */
  setTouched(path: string): void;
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
  /** Helper function to get the value of a specific field. */
  getField(path: string): FieldValue | FieldValue[];
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

const isCallback = (
  maybeFunction: any
): maybeFunction is (...args: any[]) => void =>
  typeof maybeFunction === 'function';

function useConst<T>(initialValue: T | (() => T)): T {
  const ref = useRef<T>();
  if (ref.current === undefined) {
    ref.current = isCallback(initialValue) ? initialValue() : initialValue;
  }
  return ref.current;
}

function createSetHelper<
  V extends FieldValue | FieldValue[] = any,
  T extends Obj = Obj
>(storeValue: T, storeSetter: (this: void, value: T) => void) {
  return function setHelper(pathOrValue: string | T, value?: V) {
    if (typeof pathOrValue === 'string') {
      const newValue = _set(storeValue, pathOrValue, value);
      storeSetter(newValue);
    } else {
      storeSetter(pathOrValue);
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
  const initialValues = config.initialValues || ({} as Data);
  const [data, setData] = useState<Data>(initialValues);
  const [errors, setErrors] = useState<Errors<Data>>(() =>
    deepSet(initialValues, null)
  );
  const [touched, setTouched] = useState<Touched<Data>>(() =>
    deepSet(initialValues, false)
  );

  const [warnings, setWarnings] = useState<Errors<Data>>(() =>
    deepSet(initialValues, null)
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValid, setIsValid] = useState(!config.validate);
  const [isDirty, setIsDirty] = useState(false);

  const destroyRef = useRef<() => void>();

  const { cleanup, ...rest } = useConst(() => {
    const { form, ...rest } = coreCreateForm(config, {
      storeFactory: writable,
    });
    const formRef = (node: HTMLFormElement) => {
      const { destroy } = form(node);
      destroyRef.current = destroy;
    };
    return { formRef, ...rest };
  });

  useEffect(() => {
    const dataUnsubscriber = rest.data.subscribe(setData);
    const errorsUnsubscriber = rest.errors.subscribe(setErrors);
    const touchedUnsubscriber = rest.touched.subscribe(setTouched);
    const warningsUnsubscriber = rest.warnings.subscribe(setWarnings);
    const isSubmittingUnsubscriber = rest.isSubmitting.subscribe(
      setIsSubmitting
    );
    const isValidUnsubscriber = rest.isValid.subscribe(setIsValid);
    const isDirtyUnsubscriber = rest.isDirty.subscribe(setIsDirty);

    return () => {
      dataUnsubscriber();
      errorsUnsubscriber();
      touchedUnsubscriber();
      warningsUnsubscriber();
      isSubmittingUnsubscriber();
      isValidUnsubscriber();
      isDirtyUnsubscriber();
      cleanup();
      destroyRef.current?.();
    };
  }, []);

  return {
    ...rest,
    data,
    errors,
    setErrors: createSetHelper<string | string[], Errors<Data>>(
      errors,
      rest.errors.set
    ),
    warnings,
    setWarnings: createSetHelper<string | string[], Errors<Data>>(
      warnings,
      rest.warnings.set
    ),
    touched,
    setTouched: createSetHelper<boolean, Touched<Data>>(
      touched,
      rest.touched.set
    ),
    isSubmitting,
    setIsSubmitting: rest.isSubmitting.set,
    isDirty,
    setIsDirty: rest.isDirty.set,
    isValid,
  };
}
