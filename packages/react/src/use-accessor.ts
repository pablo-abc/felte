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
  /** Writable store that contains the form's data. */
  data: Accessor<Data>;
  /** Writable store that contains the form's validation errors. */
  errors: Accessor<Errors<Data>>;
  /** Writable store that contains warnings for the form. These won't prevent a submit from happening. */
  warnings: Accessor<Errors<Data>>;
  /** Writable store that denotes if any field has been touched. */
  touched: Accessor<Touched<Data>>;
  /** Writable store containing only a boolean that represents if the form is submitting. */
  isSubmitting: Accessor<boolean>;
  /** Readable store containing only a boolean that represents if the form is valid. */
  isValid: Accessor<boolean>;
  /** Readable store containing only a boolean that represents if the form is dirty. */
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
  const previousValues = useRef<unknown[]>([]);
  const subscribedRef = useRef<SelectorOrPath<T, R>[] | boolean>(false);

  const accessor = useCallback(
    (selectorOrPath?: ((value: T) => R) | string) => {
      const subscribed = subscribedRef.current;
      if (selectorOrPath) {
        if (typeof subscribed === 'boolean') {
          subscribedRef.current ||= [selectorOrPath];
        } else {
          if (
            subscribed.every((s) => s.toString() !== selectorOrPath.toString())
          ) {
            subscribed.push(selectorOrPath);
          }
        }
      }
      return getValue(currentValue.current, selectorOrPath);
    },
    []
  ) as Accessor<T>;

  useEffect(() => {
    return store.subscribe(($store) => {
      currentValue.current = $store;
      if (!subscribedRef.current) return;
      if (subscribedRef.current === true) return setUpdate({});
      const selectors = subscribedRef.current;
      let hasChanged = false;
      for (let i = 0; i < selectors.length; i++) {
        const newValue = getValue($store, selectors[i]);
        if (typeof previousValues.current[i] === 'undefined') {
          previousValues.current[i] = newValue;
        }
        if (newValue !== previousValues.current[i]) {
          previousValues.current[i] = newValue;
          hasChanged = true;
        }
      }
      if (hasChanged) setUpdate({});
    });
  }, []);

  return accessor;
}
