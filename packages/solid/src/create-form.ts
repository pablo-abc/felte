import { createForm as coreCreateForm } from '@felte/core';
import { storeFactory } from './stores';
import { onCleanup } from 'solid-js';
import type {
  FormConfig,
  FormConfigWithTransformFn,
  FormConfigWithoutTransformFn,
  Errors,
  Touched,
  CreateSubmitHandlerConfig,
  Helpers,
  UnknownHelpers,
  KnownHelpers,
  Stores as ObservableStores,
} from '@felte/core';
import type { FelteAccessor } from './create-accessor';

type Obj = Record<string, any>;

export type Stores<Data extends Obj> = {
  data: FelteAccessor<Data>;
  errors: FelteAccessor<Errors<Data>>;
  warnings: FelteAccessor<Errors<Data>>;
  touched: FelteAccessor<Touched<Data>>;
  isSubmitting: FelteAccessor<boolean>;
  isValid: FelteAccessor<boolean>;
  isDirty: FelteAccessor<boolean>;
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
  observables: ObservableStores<Data>;
} & Stores<Data>;

export function createForm<Data extends Obj = Obj, Ext extends Obj = Obj>(
  config: FormConfigWithTransformFn<Data> & Ext
): Form<Data> & UnknownHelpers<Data>;
export function createForm<Data extends Obj = Obj, Ext extends Obj = Obj>(
  config?: FormConfigWithoutTransformFn<Data> & Ext
): Form<Data> & KnownHelpers<Data>;
export function createForm<Data extends Obj = Obj, Ext extends Obj = Obj>(
  config?: FormConfig<Data> & Ext
): Form<Data> & Helpers<Data> {
  const {
    form: formAction,
    data,
    errors,
    warnings,
    touched,
    isSubmitting,
    isValid,
    isDirty,
    cleanup,
    ...rest
  } = coreCreateForm(config ?? {}, {
    storeFactory,
  });
  function form(node: HTMLFormElement) {
    const { destroy } = formAction(node);
    onCleanup(destroy);
    return { destroy };
  }

  onCleanup(cleanup);

  return {
    ...rest,
    form,
    data: (data as any).getSolidValue(),
    errors: (errors as any).getSolidValue(),
    warnings: (warnings as any).getSolidValue(),
    touched: (touched as any).getSolidValue(),
    isSubmitting: (isSubmitting as any).getSolidValue(),
    isValid: (isValid as any).getSolidValue(),
    isDirty: (isDirty as any).getSolidValue(),
    observables: {
      data,
      errors,
      warnings,
      touched,
      isSubmitting,
      isValid,
      isDirty,
    },
  };
}
