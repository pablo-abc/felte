import { useEffect, useState } from 'react';
import type { Readable } from 'svelte/store';
import { get } from 'svelte/store';
import { _isPlainObject } from '@felte/core';

export function useValue<T, R>(
  store: Readable<T>,
  selector: (value: T) => R
): R;
export function useValue<T>(store: Readable<T>): T;
export function useValue<T, R>(store: Readable<T>, selector?: (value: T) => R) {
  const [value, setValue] = useState(() => {
    const $store = get(store);
    if (!_isPlainObject($store)) return $store;
    if (!selector) return $store;
    return selector($store);
  });

  useEffect(() => {
    const unsubscriber = store.subscribe(($store) => {
      let newValue;
      if (!_isPlainObject($store) || !selector) {
        newValue = $store;
      } else {
        newValue = selector($store);
      }
      setValue(newValue);
    });
    return unsubscriber;
  }, []);

  return value;
}
