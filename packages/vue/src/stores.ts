import { shallowRef, watch } from 'vue';
import type { Writable } from '@felte/core';

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
export function writable<T>(value?: T): Writable<T> {
  const ref = shallowRef(value);

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

  return { subscribe, set, update };
}
