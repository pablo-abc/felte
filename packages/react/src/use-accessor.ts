import { useEffect, useState, useRef, useCallback } from 'react';
import type { Obj, Errors, Touched } from '@felte/core';
import type { Readable } from 'svelte/store';
import { get } from 'svelte/store';
import { _isPlainObject, _get } from '@felte/core';

export type Accessor<T> = T extends Obj
  ? (<R>(selector: (storeValue: T) => R) => R) &
      ((path: string) => unknown) &
      (() => T)
  : (<R>(deriveFn: (storeValue: T) => R) => R) & (() => T);

export type Stores<Data extends Obj> = {
  data: Accessor<Data>;
  errors: Accessor<Errors<Data>>;
  warnings: Accessor<Errors<Data>>;
  touched: Accessor<Touched<Data>>;
  isSubmitting: Accessor<boolean>;
  isValid: Accessor<boolean>;
  isDirty: Accessor<boolean>;
};

type SelectorOrPath<T, R> = string | ((value: T) => R);

function getValue<T, R>(
  storeValue: T,
  selectorOrPath?: ((value: T) => R) | string
) {
  if (!_isPlainObject(storeValue) || !selectorOrPath) return storeValue;
  if (typeof selectorOrPath === 'string') {
    return _get(storeValue, selectorOrPath);
  }
  return selectorOrPath(storeValue);
}

export function useAccessor<T, R>(store: Readable<T>): Accessor<T> {
  const [, setUpdate] = useState({});
  const currentValue = useRef<T>(get(store));
  const values = useRef<Record<string, unknown>>({});
  const subscribedRef = useRef<SelectorOrPath<T, R>[] | boolean>(false);

  const accessor = useCallback(
    (selectorOrPath?: ((value: T) => R) | string) => {
      const subscribed = subscribedRef.current;
      if (!selectorOrPath) {
        subscribedRef.current = true;
        return currentValue.current;
      }
      if (typeof subscribed === 'boolean') {
        subscribedRef.current ||= [selectorOrPath];
      } else {
        if (
          subscribed.every((s) => s.toString() !== selectorOrPath.toString())
        ) {
          subscribed.push(selectorOrPath);
        }
      }
      return (
        values.current[selectorOrPath.toString()] ??
        getValue(currentValue.current, selectorOrPath)
      );
    },
    []
  ) as Accessor<T>;

  useEffect(() => {
    return store.subscribe(($store) => {
      currentValue.current = $store;
      if (!subscribedRef.current) return;
      if (subscribedRef.current === true) return setUpdate({});
      let hasChanged = false;
      for (const selector of subscribedRef.current) {
        const newValue = getValue($store, selector);
        if (typeof values.current[selector.toString()] === 'undefined') {
          values.current[selector.toString()] = newValue;
        }
        if (newValue !== values.current[selector.toString()]) {
          values.current[selector.toString()] = newValue;
          hasChanged = true;
        }
      }
      if (hasChanged) setUpdate({});
    });
  }, []);

  return accessor;
}
