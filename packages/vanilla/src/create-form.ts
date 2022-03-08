import type {
  Paths,
  FormConfig,
  Obj,
  Helpers,
  KnownHelpers,
  UnknownHelpers,
  Stores,
  KnownStores,
  UnknownStores,
  FormConfigWithTransformFn,
  FormConfigWithoutTransformFn,
  Form,
} from '@felte/core';
import { createForm as coreCreateForm } from '@felte/core';
import { writable } from './stores';

export function createForm<Data extends Obj = any, Ext extends Obj = Obj>(
  config: FormConfigWithTransformFn<Data> & Ext
): Form<Data> & UnknownHelpers<Data, Paths<Data>> & UnknownStores<Data>;
export function createForm<Data extends Obj = any, Ext extends Obj = Obj>(
  config?: FormConfigWithoutTransformFn<Data> & Ext
): Form<Data> & KnownHelpers<Data, Paths<Data>> & KnownStores<Data>;
export function createForm<Data extends Obj = Obj>(
  config?: FormConfig<Data>
): Form<Data> & Helpers<Data, Paths<Data>> & Stores<Data> {
  const { form, startStores, ...rest } = coreCreateForm(
    { ...config, preventStoreStart: true },
    {
      storeFactory: writable,
    }
  );
  return {
    ...rest,
    form: (el: HTMLFormElement) => {
      const { destroy } = form(el);
      const cleanup = startStores();
      return {
        destroy: () => {
          destroy();
          cleanup();
        },
      };
    },
  };
}
