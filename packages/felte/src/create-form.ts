import { createForm as coreCreateForm } from '@felte/core';
import { writable } from 'svelte/store';
import { onDestroy } from 'svelte';
import type {
  Form,
  Paths,
  FormConfig,
  FormConfigWithTransformFn,
  FormConfigWithoutTransformFn,
  Stores,
  KnownStores,
  UnknownStores,
  Helpers,
  KnownHelpers,
  UnknownHelpers,
} from '@felte/core';

type Obj = Record<string, any>;

export function createForm<Data extends Obj = any, Ext extends Obj = any>(
  config: FormConfigWithTransformFn<Data> & Ext
): Form<Data> & UnknownHelpers<Data, Paths<Data>> & UnknownStores<Data>;
export function createForm<Data extends Obj = any, Ext extends Obj = any>(
  config?: FormConfigWithoutTransformFn<Data> & Ext
): Form<Data> & KnownHelpers<Data, Paths<Data>> & KnownStores<Data>;
export function createForm<Data extends Obj = any, Ext extends Obj = any>(
  config?: FormConfig<Data> & Ext
): Form<Data> & Helpers<Data, Paths<Data>> & Stores<Data> {
  const { cleanup, startStores, ...rest } = coreCreateForm(config ?? {}, {
    storeFactory: writable,
  });
  onDestroy(cleanup);
  return rest;
}
