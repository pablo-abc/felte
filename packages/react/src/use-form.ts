import { useRef, useEffect, useState } from 'react';
import type {
  FormConfig,
  Obj,
  Errors,
  Touched,
  CreateSubmitHandlerConfig,
  Helpers,
  KnownHelpers,
  UnknownHelpers,
  FormConfigWithTransformFn,
  FormConfigWithoutTransformFn,
} from '@felte/core';
import { createForm as coreCreateForm } from '@felte/core';
import { writable } from './stores';
import type { Stores, UnknownStores, KnownStores } from './use-accessor';
import { useAccessor } from './use-accessor';

/** The return type for the `createForm` function. */
export type Form<Data extends Obj> = {
  /** Action function to be used with the `use` directive on your `form` elements. */
  form(form?: HTMLFormElement): void;
  /** Function to handle submit to be passed to the on:submit event. Not necessary if using the `form` action. */
  handleSubmit(e?: Event): void;
  /** Function that creates a submit handler. If a function is passed as first argument it overrides the default `onSubmit` function set in the `createForm` config object. */
  createSubmitHandler(
    altConfig?: CreateSubmitHandlerConfig<Data>
  ): (e?: Event) => void;
};

function useConst<T>(setup: () => T): T {
  const ref = useRef<T>();
  if (ref.current === undefined) {
    ref.current = setup();
  }
  return ref.current;
}

export function useForm<Data extends Obj = Obj, Ext extends Obj = Obj>(
  config: FormConfigWithTransformFn<Data> & Ext
): Form<Data> & UnknownHelpers<Data> & UnknownStores<Data>;
export function useForm<Data extends Obj = Obj, Ext extends Obj = Obj>(
  config?: FormConfigWithoutTransformFn<Data> & Ext
): Form<Data> & KnownHelpers<Data> & KnownStores<Data>;
export function useForm<Data extends Obj = Obj>(
  config?: FormConfig<Data>
): Form<Data> & Helpers<Data> & Stores<Data> {
  const [formElement, setFormElement] = useState<HTMLFormElement | null>();
  const destroyRef = useRef<() => void>();

  const { startStores, form, ...rest } = useConst(() => {
    const coreConfig = {
      ...config,
      preventStoreStart: true,
    };
    const { form: coreForm, ...rest } = coreCreateForm(coreConfig, {
      storeFactory: writable,
    });
    const form = (node?: HTMLFormElement | null) => {
      if (!node) return;
      const { destroy } = coreForm(node);
      destroyRef.current = destroy;
    };
    return { form, ...rest };
  });

  const data = useAccessor<Data>(rest.data);
  const errors = useAccessor<Errors<Data>>(rest.errors);
  const touched = useAccessor<Touched<Data>>(rest.touched);
  const warnings = useAccessor<Errors<Data>>(rest.warnings);
  const isSubmitting = useAccessor<boolean>(rest.isSubmitting);
  const isDirty = useAccessor<boolean>(rest.isDirty);
  const isValid = useAccessor<boolean>(rest.isValid);

  useEffect(() => {
    const cleanup = startStores();
    form(formElement);
    return () => {
      cleanup();
      destroyRef.current?.();
    };
  }, [formElement]);

  return {
    ...rest,
    form: setFormElement,
    data,
    errors,
    warnings,
    touched,
    isSubmitting,
    isDirty,
    isValid,
  };
}
