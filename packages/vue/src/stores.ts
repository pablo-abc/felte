import { shallowRef, watch } from 'vue';
import type { StoreFactory, Writable } from '@felte/core';
import { createAccessor, type FelteAccessor } from './create-accessor';

/** Callback to inform of a value updates. */
export type Subscriber<T> = (value: T) => void;

/** Unsubscribes from value updates. */
export type Unsubscriber = () => void;

/** Callback to update a value. */
export type Updater<T> = (value: T) => T;

export function safe_not_equal(a: unknown, b: unknown) {
  /* istanbul ignore next */
  return a != a
    ? b == b
    : a !== b || (a && typeof a === 'object') || typeof a === 'function';
}

export const storeFactory: StoreFactory<FelteAccessor<any>> = <T>(
  value?: T
) => {
  const ref = shallowRef(value);
  const accessor = createAccessor(ref);

  function subscribe(run: Subscriber<T>): Unsubscriber {
    return watch(
      ref,
      (value) => {
        run(value as any);
      },
      { immediate: true }
    );
  }

  function set(value: T) {
    if (safe_not_equal(ref.value, value)) {
      ref.value = value;
    }
  }

  function update(fn: Updater<T>) {
    set(fn(ref.value as any));
  }

  accessor.subscribe = subscribe;
  accessor.set = set;
  accessor.update = update;

  return accessor as FelteAccessor<T> & Writable<T>;
};
