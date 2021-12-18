import { createForm as coreCreateForm } from '@felte/core';
import { writable } from 'svelte/store';
import { onDestroy } from 'svelte';
import type {
  Form,
  FormConfig,
  FormConfigWithInitialValues,
  FormConfigWithoutInitialValues,
} from '@felte/core';

type Obj = Record<string, any>;

/**
 * Creates the stores and `form` action to make the form reactive.
 * In order to use auto-subscriptions with the stores, call this function at the top-level scope of the component.
 *
 * @param config - Configuration for the form itself. Since `initialValues` is set, `Data` will not be undefined
 *
 * @category Main
 */
export function createForm<Data extends Obj = any, Ext extends Obj = any>(
  config: FormConfigWithInitialValues<Data> & Ext
): Form<Data>;
/**
 * Creates the stores and `form` action to make the form reactive.
 * In order to use auto-subscriptions with the stores, call this function at the top-level scope of the component.
 *
 * @param config - Configuration for the form itself. Since `initialValues` is not set (when only using the `form` action), `Data` will be undefined until the `form` element loads.
 */
export function createForm<Data extends Obj = any, Ext extends Obj = any>(
  config: FormConfigWithoutInitialValues<Data> & Ext
): Form<Data>;
export function createForm<Data extends Obj = any, Ext extends Obj = any>(
  config: FormConfig<Data> & Ext
): Form<Data> {
  const { cleanup, ...rest } = coreCreateForm(config, {
    storeFactory: writable,
  });
  onDestroy(cleanup);
  return rest;
}
