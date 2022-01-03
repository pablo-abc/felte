import { useRef, useEffect } from 'react';
import type {
  FormConfig,
  Obj,
  CreateSubmitHandlerConfig,
  Helpers,
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
} & Stores<Data> &
  Helpers<Data>;

function useConst<T>(setup: () => T): T {
  const ref = useRef<T>();
  if (ref.current === undefined) {
    ref.current = setup();
  }
  return ref.current;
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
    warnings,
    touched,
    isSubmitting,
    isDirty,
    isValid,
  };
}
