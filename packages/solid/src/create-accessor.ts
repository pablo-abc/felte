import type { Obj, Errors, Touched, TransWritable } from '@felte/core';
import type { Accessor } from 'solid-js';
import type { Writable, Readable } from 'svelte/store';
import { getValue } from '@felte/core';
import { untrack, createSignal, createEffect } from 'solid-js';

export type FelteAccessor<T> = T extends Obj
  ? (<R>(selector: (storeValue: T) => R) => R) &
      ((path: string) => unknown) &
      (() => T)
  : (<R>(deriveFn: (storeValue: T) => R) => R) & (() => T);

export type UnknownStores<Data extends Obj> = Omit<Stores<Data>, 'data'> & {
  data: FelteAccessor<Data> & TransWritable<Data>;
};

export type KnownStores<Data extends Obj> = Omit<Stores<Data>, 'data'> & {
  data: FelteAccessor<Data> & Writable<Data>;
};

export type Stores<Data extends Obj> = {
  data: FelteAccessor<Data> & Writable<Data>;
  errors: FelteAccessor<Errors<Data>> & Writable<Errors<Data>>;
  warnings: FelteAccessor<Errors<Data>> & Writable<Errors<Data>>;
  touched: FelteAccessor<Touched<Data>> & Writable<Touched<Data>>;
  isSubmitting: FelteAccessor<boolean> & Writable<boolean>;
  isValid: FelteAccessor<boolean> & Readable<boolean>;
  isDirty: FelteAccessor<boolean> & Writable<boolean>;
};

type SelectorOrPath<T, R> = string | ((value: T) => R);

export function createAccessor<T, R>(store: Accessor<T>): FelteAccessor<T> {
  const subscribed: Record<string, SelectorOrPath<T, R>> = {};
  const signals: Record<string, ReturnType<typeof createSignal>> = {};
  function felteAccessor(selectorOrPath?: SelectorOrPath<T, R>) {
    if (!selectorOrPath) return store();
    if (!subscribed[selectorOrPath.toString()]) {
      const valueSignal = createSignal(
        getValue(untrack(store), selectorOrPath) as unknown
      );
      signals[selectorOrPath.toString()] = valueSignal;
      subscribed[selectorOrPath.toString()] = selectorOrPath;
    }
    const [value] = signals[selectorOrPath.toString()];
    return value();
  }

  createEffect(() => {
    const storeValue = store();
    const keys = Object.keys(subscribed);
    for (const key of keys) {
      const subscriber = subscribed[key];
      const newValue = getValue(storeValue, subscriber) as unknown;
      const [value, setValue] = signals[subscriber.toString()];
      if (newValue === untrack(value)) continue;
      setValue(newValue);
    }
  });

  return felteAccessor as FelteAccessor<T>;
}
