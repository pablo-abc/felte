import { createForm as coreCreateForm } from '@felte/core';
import { createStores } from './stores';
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
export function createForm<Data extends Obj = Obj, Ext extends Obj = Obj>(
  config: FormConfigWithInitialValues<Data> & Ext
): Form<Data>;
/**
 * Creates the stores and `form` action to make the form reactive.
 * In order to use auto-subscriptions with the stores, call this function at the top-level scope of the component.
 *
 * @param config - Configuration for the form itself. Since `initialValues` is not set (when only using the `form` action), `Data` will be undefined until the `form` element loads.
 */
export function createForm<Data extends Obj = Obj, Ext extends Obj = Obj>(
  config: FormConfigWithoutInitialValues<Data> & Ext
): Form<Data>;
export function createForm<Data extends Obj = Obj, Ext extends Obj = Obj>(
  config: FormConfig<Data> & Ext
): Form<Data> {
  const stores = createStores(config);
  return coreCreateForm(config, { stores });
}
