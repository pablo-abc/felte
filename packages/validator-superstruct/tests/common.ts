import 'uvu-expect-dom/extend';
import type { CoreForm } from '@felte/core';
import { createForm as coreCreateForm } from '@felte/core';
import { writable } from 'svelte/store';
import type {
  FormConfig,
  FormConfigWithTransformFn,
  FormConfigWithoutTransformFn,
  Obj,
  UnknownStores,
  Stores,
  KnownStores,
  Helpers,
  UnknownHelpers,
  KnownHelpers,
} from '@felte/common';

export function createForm<Data extends Obj>(
  config?: FormConfigWithTransformFn<Data>
): CoreForm<Data> & UnknownHelpers<Data> & UnknownStores<Data>;
export function createForm<Data extends Obj>(
  config?: FormConfigWithoutTransformFn<Data>
): CoreForm<Data> & KnownHelpers<Data> & KnownStores<Data>;
export function createForm<Data extends Obj>(
  config: FormConfig<Data> = {}
): CoreForm<Data> & Helpers<Data> & Stores<Data> {
  return coreCreateForm(config as any, {
    storeFactory: writable,
  });
}
