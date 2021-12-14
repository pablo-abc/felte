import { createForm as coreCreateForm } from '@felte/core';
import { createStores } from './stores';
import { onCleanup } from 'solid-js';
import type {
  FormConfig,
  FormConfigWithInitialValues,
  FormConfigWithoutInitialValues,
  Errors,
  Touched,
  CreateSubmitHandlerConfig,
  FieldValue,
} from '@felte/core';
import type { Accessor } from 'solid-js';
import type { Store } from 'solid-js/store';
import type { Observables } from './stores';

type Obj = Record<string, any>;

export type Stores<Data extends Obj> = {
  data: Store<Data>;
  errors: Store<Errors<Data>>;
  touched: Store<Touched<Data>>;
  isSubmitting: Accessor<boolean>;
  isValid: Accessor<boolean>;
  isDirty: Accessor<boolean>;
};

/** The return type for the `createForm` function. */
export type Form<Data extends Obj> = {
  /** Action function to be used with the `use` directive on your `form` elements. */
  form: (node: HTMLFormElement) => { destroy: () => void };
  /** Function to handle submit to be passed to the on:submit event. Not necessary if using the `form` action. */
  handleSubmit: (e?: Event) => void;
  /** Function that creates a submit handler. If a function is passed as first argument it overrides the default `onSubmit` function set in the `createForm` config object. */
  createSubmitHandler: (
    altConfig?: CreateSubmitHandlerConfig<Data>
  ) => (e?: Event) => void;
  /** Function that resets the form to its initial values */
  reset: () => void;
  /** Helper function to touch a specific field. */
  setTouched: (path: string) => void;
  /** Helper function to set an error to a specific field. */
  setError: (path: string, error: string | string[]) => void;
  /** Helper function to set the value of a specific field. Set `touch` to `false` if you want to set the value without setting the field to touched. */
  setField: (path: string, value?: FieldValue, touch?: boolean) => void;
  /** Helper function to get the value of a specific field. */
  getField(path: string): FieldValue | FieldValue[];
  /** Helper function to set all values of the form. Useful for "initializing" values after the form has loaded. */
  setFields: (values: Data) => void;
  /** Helper function that validates every fields and touches all of them. It updates the `errors` store. */
  validate: () => Promise<Errors<Data> | void>;
  /** Helper function to re-set the initialValues of Felte. No reactivity will be triggered but this will be the data the form will be reset to when caling `reset`. */
  setInitialValues: (values: Data) => void;
  observables: Observables<Data>;
} & Stores<Data>;
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
  const { form: formAction, ...rest } = coreCreateForm(config, { stores });
  function form(node: HTMLFormElement) {
    const { destroy } = formAction(node);
    onCleanup(destroy);
    return { destroy };
  }
  return {
    ...rest,
    form,
    data: stores.data.getter(),
    errors: stores.errors.getter(),
    touched: stores.touched.getter(),
    isSubmitting: stores.isSubmitting.getter(),
    isValid: stores.isValid.getter(),
    isDirty: stores.isDirty.getter(),
    observables: stores,
  };
}
