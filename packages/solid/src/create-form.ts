import { createForm as coreCreateForm } from '@felte/core';
import { storeFactory } from './stores';
import { createEffect, createSignal, onCleanup } from 'solid-js';
import type {
  Errors,
  Touched,
  FormConfig,
  FormConfigWithTransformFn,
  FormConfigWithoutTransformFn,
  CreateSubmitHandlerConfig,
  Helpers,
  UnknownHelpers,
  KnownHelpers,
  Keyed,
  Paths,
  KeyedWritable,
  Writable,
} from '@felte/core';
import type {
  Stores,
  KnownStores,
  UnknownStores,
  FelteAccessor,
} from './create-accessor';

type Obj = Record<string, any>;

/** The return type for the `createForm` function. */
export type Form<Data extends Obj> = {
  /** Action function to be used with the `use` directive on your `form` elements. */
  form: (node: HTMLFormElement) => { destroy: () => void };
  /** Function to handle submit to be passed to the on:submit event. Not necessary if using the `form` action. */
  handleSubmit: (e?: Event) => void;
  /** Function that creates a submit handler. If a function is passed as first argument it overrides the default `onSubmit` function set in the `createForm` config object. */
  createSubmitHandler: (
    altConfig?: CreateSubmitHandlerConfig<Data>,
  ) => (e?: Event) => void;
};

export function createForm<Data extends Obj = any, Ext extends Obj = Obj>(
  config: FormConfigWithTransformFn<Data> & Ext,
): Form<Data> & UnknownHelpers<Data, Paths<Data>> & UnknownStores<Data>;
export function createForm<Data extends Obj = any, Ext extends Obj = Obj>(
  config?: FormConfigWithoutTransformFn<Data> & Ext,
): Form<Data> & KnownHelpers<Data, Paths<Data>> & KnownStores<Data>;
export function createForm<Data extends Obj = any, Ext extends Obj = Obj>(
  config?: FormConfig<Data> & Ext,
): Form<Data> & Helpers<Data, Paths<Data>> & Stores<Data> {
  const {
    form: formAction,
    cleanup,
    startStores,
    data,
    errors,
    warnings,
    touched,
    ...rest
  } = coreCreateForm(config ?? {}, {
    storeFactory,
  });

  let _destroy: (() => void) | null = null;
  const destroy = () => _destroy?.();
  const [node, setNode] = createSignal<HTMLFormElement | null>(null);
  createEffect(() => {
    const _node = node();
    if (_node) {
      destroy();
      _destroy = formAction(_node).destroy;
    }
  });
  const form = (_node: HTMLFormElement) => {
    setNode(_node);
    return {
      destroy,
    };
  };

  onCleanup(destroy);
  onCleanup(cleanup);

  return {
    ...rest,
    data: data as KeyedWritable<Data> & FelteAccessor<Keyed<Data>>,
    errors: errors as unknown as Writable<Errors<Data>> &
      FelteAccessor<Errors<Data>>,
    warnings: warnings as unknown as Writable<Errors<Data>> &
      FelteAccessor<Errors<Data>>,
    touched: touched as Writable<Touched<Data>> & FelteAccessor<Touched<Data>>,
    form,
  };
}
