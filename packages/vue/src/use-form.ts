import type {
  Paths,
  FormConfig,
  Obj,
  Helpers,
  KnownHelpers,
  UnknownHelpers,
  FormConfigWithTransformFn,
  FormConfigWithoutTransformFn,
  Form as CoreForm,
  Keyed,
  KeyedWritable,
  Writable,
  Errors,
  Touched,
} from '@felte/core';
import type {
  Stores,
  UnknownStores,
  KnownStores,
  FelteAccessor,
} from './create-accessor';
import { createAccessor } from './create-accessor';
import { createForm as coreCreateForm } from '@felte/core';
import { writable } from './stores';

export type Form<Data extends Obj = Obj> = Omit<CoreForm<Data>, 'form'> & {
  vForm: {
    mounted: (el: HTMLFormElement) => void;
    unmounted: (el: HTMLFormElement) => void;
  };
};

const cleanups = new WeakMap<HTMLFormElement, () => void>();

export function useForm<Data extends Obj = any, Ext extends Obj = Obj>(
  config: FormConfigWithTransformFn<Data> & Ext
): Form<Data> & UnknownHelpers<Data, Paths<Data>> & UnknownStores<Data>;
export function useForm<Data extends Obj = any, Ext extends Obj = Obj>(
  config?: FormConfigWithoutTransformFn<Data> & Ext
): Form<Data> & KnownHelpers<Data, Paths<Data>> & KnownStores<Data>;
export function useForm<Data extends Obj = Obj>(
  config?: FormConfig<Data>
): Form<Data> & Helpers<Data, Paths<Data>> & Stores<Data> {
  const { form, startStores, ...rest } = coreCreateForm(
    { ...config, preventStoreStart: true },
    {
      storeFactory: writable,
    }
  );

  const data = createAccessor<Keyed<Data>>(rest.data) as FelteAccessor<
    Keyed<Data>
  > &
    KeyedWritable<Data>;
  const errors = createAccessor<Errors<Data>>(
    rest.errors as Writable<Errors<Data>>
  );
  const touched = createAccessor<Touched<Data>>(rest.touched);
  const warnings = createAccessor<Errors<Data>>(
    rest.warnings as Writable<Errors<Data>>
  );
  const isSubmitting = createAccessor<boolean>(rest.isSubmitting);
  const isDirty = createAccessor<boolean>(rest.isDirty);
  const isValid = createAccessor<boolean>(rest.isValid);
  const isValidating = createAccessor<boolean>(rest.isValidating);
  const interacted = createAccessor<string | null>(rest.interacted);
  return {
    ...rest,
    vForm: {
      mounted: (el: HTMLFormElement) => {
        const { destroy } = form(el);
        const cleanup = startStores();
        cleanups.set(el, () => {
          destroy();
          cleanup();
        });
      },
      unmounted: (el: HTMLFormElement) => {
        const cleanup = cleanups.get(el);
        if (cleanup) cleanup();
      },
    },
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
