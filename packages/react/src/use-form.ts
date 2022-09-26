import type { Ref } from 'react';
import { useRef, useEffect } from 'react';
import type {
  Paths,
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
  Keyed,
  KeyedWritable,
  Writable,
} from '@felte/core';
import { createForm as coreCreateForm } from '@felte/core';
import { writable } from './stores';
import type {
  Stores,
  UnknownStores,
  KnownStores,
  Accessor,
} from './use-accessor';
import { useAccessor } from './use-accessor';
import { useConst } from './use-const';

/** The return type for the `createForm` function. */
export type Form<Data extends Obj> = {
  /** Action function to be used with the `use` directive on your `form` elements. */
  form: Ref<HTMLFormElement>;
  /** Function to handle submit to be passed to the on:submit event. Not necessary if using the `form` action. */
  handleSubmit(e?: Event): void;
  /** Function that creates a submit handler. If a function is passed as first argument it overrides the default `onSubmit` function set in the `createForm` config object. */
  createSubmitHandler(
    altConfig?: CreateSubmitHandlerConfig<Data>
  ): (e?: Event) => void;
};

export function useForm<Data extends Obj = any, Ext extends Obj = Obj>(
  config: FormConfigWithTransformFn<Data> & Ext
): Form<Data> & UnknownHelpers<Data, Paths<Data>> & UnknownStores<Data>;
export function useForm<Data extends Obj = any, Ext extends Obj = Obj>(
  config?: FormConfigWithoutTransformFn<Data> & Ext
): Form<Data> & KnownHelpers<Data, Paths<Data>> & KnownStores<Data>;
export function useForm<Data extends Obj = Obj>(
  config?: FormConfig<Data>
): Form<Data> & Helpers<Data, Paths<Data>> & Stores<Data> {
  const formRef = useRef<HTMLFormElement>(null);
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

  const data = useAccessor<Keyed<Data>>(rest.data) as Accessor<Keyed<Data>> &
    KeyedWritable<Data>;
  const errors = useAccessor<Errors<Data>>(
    rest.errors as Writable<Errors<Data>>
  );
  const touched = useAccessor<Touched<Data>>(rest.touched);
  const warnings = useAccessor<Errors<Data>>(
    rest.warnings as Writable<Errors<Data>>
  );
  const isSubmitting = useAccessor<boolean>(rest.isSubmitting);
  const isDirty = useAccessor<boolean>(rest.isDirty);
  const isValid = useAccessor<boolean>(rest.isValid);
  const isValidating = useAccessor<boolean>(rest.isValidating);
  const interacted = useAccessor<string | null>(rest.interacted);

  useEffect(() => {
    const cleanup = startStores();
    form(formRef.current);
    return () => {
      cleanup();
      destroyRef.current?.();
    };
  }, []);

  return {
    ...rest,
    form: formRef,
    data,
    errors,
    warnings,
    touched,
    isSubmitting,
    isDirty,
    isValid,
    isValidating,
    interacted,
  };
}
