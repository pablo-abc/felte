import { useEffect, useState, useRef, useCallback } from 'preact/hooks';
import type {
  Obj,
  Errors,
  Touched,
  TransWritable,
  Traverse,
  Paths,
  Keyed,
  KeyedWritable,
} from '@felte/core';
import type { Readable, Writable } from 'svelte/store';
import { getValue, getValueFromStore, isEqual } from '@felte/core';

export type Accessor<T> = T extends Obj
  ? (<R>(selector: (storeValue: T) => R) => R) &
      (<
        P extends Paths<T> = Paths<T>,
        V extends Traverse<T, P> = Traverse<T, P>
      >(
        path: P
      ) => V) &
      (() => T)
  : T extends string | boolean | null
  ? (<R>(deriveFn: (storeValue: T) => R) => R) & (() => T)
  : ((selector: (storeValue: any) => any) => any) &
      ((path: string) => any) &
      (() => any);

export type UnknownStores<Data extends Obj> = Omit<Stores<Data>, 'data'> & {
  data: Accessor<Keyed<Data>> & TransWritable<Data>;
};

export type KnownStores<Data extends Obj> = Omit<Stores<Data>, 'data'> & {
  data: Accessor<Keyed<Data>> & KeyedWritable<Data>;
};

export type Stores<Data extends Obj> = {
  data: Accessor<Keyed<Data>> & KeyedWritable<Data>;
  errors: Accessor<Errors<Data>> & Writable<Errors<Data>>;
  warnings: Accessor<Errors<Data>> & Writable<Errors<Data>>;
  touched: Accessor<Touched<Data>> & Writable<Touched<Data>>;
  isSubmitting: Accessor<boolean> & Writable<boolean>;
  isValid: Accessor<boolean> & Readable<boolean>;
  isDirty: Accessor<boolean> & Writable<boolean>;
  isValidating: Accessor<boolean> & Readable<boolean>;
  interacted: Accessor<string | null> & Writable<string | null>;
};

type SelectorOrPath<T> = string | (<R>(value: T) => R);

function isWritable<T>(store: Readable<T>): store is Writable<T> {
  return !!(store as any).set;
}

export function useAccessor<T>(store: Writable<T>): Accessor<T> & Writable<T>;
export function useAccessor<T>(store: Readable<T>): Accessor<T> & Readable<T>;
export function useAccessor<T>(
  store: Readable<T> | Writable<T>
): Accessor<T> & (Readable<T> | Writable<T>) {
  const [, setUpdate] = useState({});
  const storeValue = useRef<T>(getValueFromStore(store));
  const values = useRef<Record<string, unknown>>({});
  const subscribedRef = useRef<Record<string, SelectorOrPath<T>> | boolean>(
    false
  );

  const accessor = useCallback(
    (selectorOrPath?: (<R>(value: T) => R) | string) => {
      const subscribed = subscribedRef.current;
      if (!selectorOrPath) {
        subscribedRef.current = true;
        return storeValue.current;
      }
      if (typeof subscribed === 'boolean') {
        subscribedRef.current ||= {
          [selectorOrPath.toString()]: selectorOrPath,
        };
      } else {
        subscribed[selectorOrPath.toString()] = selectorOrPath;
      }
      let value = values.current[selectorOrPath.toString()];
      if (value == null) {
        value = values.current[selectorOrPath.toString()] = getValue(
          storeValue.current,
          selectorOrPath
        );
      }
      return value;
    },
    []
  ) as Accessor<T> & Writable<T>;

  accessor.subscribe = store.subscribe;
  if (isWritable(store)) {
    accessor.set = store.set;
    accessor.update = store.update;
  }

  useEffect(() => {
    return store.subscribe(($store) => {
      storeValue.current = $store;
      if (!subscribedRef.current) return;
      if (subscribedRef.current === true) return setUpdate({});
      let hasChanged = false;
      const keys = Object.keys(subscribedRef.current);
      for (const key of keys) {
        const selector = subscribedRef.current[key];
        const newValue = getValue($store, selector);
        if (!isEqual(newValue, values.current[selector.toString()])) {
          values.current[selector.toString()] = newValue;
          hasChanged = true;
        }
      }
      if (hasChanged) setUpdate({});
    });
  }, []);

  return accessor;
}
