import { useEffect, useState } from 'react';
import type { Readable } from 'svelte/store';
import { get } from 'svelte/store';
import { _isPlainObject, _get } from '@felte/core';

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

export function useValue<T, R>(store: Readable<T>, path: string): unknown;
export function useValue<T, R>(
  store: Readable<T>,
  selector: (value: T) => R
): R;
export function useValue<T>(store: Readable<T>): T;
export function useValue<T, R>(
  store: Readable<T>,
  selectorOrPath?: ((value: T) => R) | string
) {
  const [value, setValue] = useState(() => {
    const $store = get(store);
    return getValue($store, selectorOrPath);
  });

  useEffect(() => {
    const unsubscriber = store.subscribe(($store) => {
      const newValue = getValue($store, selectorOrPath);
      setValue(newValue);
    });
    return unsubscriber;
  }, []);

  return value;
}
