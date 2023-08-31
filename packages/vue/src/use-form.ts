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
import { createForm as coreCreateForm } from '@felte/core';
import { storeFactory } from './stores';

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
  const { form, startStores, data, errors, warnings, touched, ...rest } =
    coreCreateForm(
      { ...config, preventStoreStart: true },
      {
        storeFactory,
      }
    );

  return {
    ...rest,
    data: data as KeyedWritable<Data> & FelteAccessor<Keyed<Data>>,
    errors: errors as Writable<Errors<Data>> & FelteAccessor<Errors<Data>>,
    warnings: warnings as Writable<Errors<Data>> & FelteAccessor<Errors<Data>>,
    touched: touched as Writable<Touched<Data>> & FelteAccessor<Touched<Data>>,
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
  };
}
