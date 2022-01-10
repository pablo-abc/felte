import { createForm as coreCreateForm } from '@felte/core';
import { writable } from 'svelte/store';
import { onDestroy } from 'svelte';
import type {
  Form,
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

export function createForm<Data extends Obj = Obj, Ext extends Obj = Obj>(
  config: FormConfigWithTransformFn<Data> & Ext
): Form<Data> & UnknownHelpers<Data> & UnknownStores<Data>;
export function createForm<Data extends Obj = Obj, Ext extends Obj = Obj>(
  config?: FormConfigWithoutTransformFn<Data> & Ext
): Form<Data> & KnownHelpers<Data> & KnownStores<Data>;
export function createForm<Data extends Obj = Obj, Ext extends Obj = Obj>(
  config?: FormConfig<Data> & Ext
): Form<Data> & Helpers<Data> & Stores<Data> {
  const { cleanup, ...rest } = coreCreateForm(config ?? {}, {
    storeFactory: writable,
  });
  onDestroy(cleanup);
  return rest;
}
