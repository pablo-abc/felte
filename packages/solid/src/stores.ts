import type { StoreFactory } from '@felte/core';
import { createEffect, createSignal, createRoot } from 'solid-js';
import { createAccessor, FelteAccessor } from './create-accessor';

const isCallback = (
  maybeFunction: any
): maybeFunction is (...args: any[]) => void =>
  typeof maybeFunction === 'function';

function createSubscriber<T>(store: T | (() => T)) {
  return function subscribe(fn: (data: T) => void) {
    const value = isCallback(store) ? store : () => store;
    fn(value());
    let disposer: () => void | undefined;
    createRoot((dispose) => {
      disposer = dispose;
      createEffect(() => fn(value()));
      return dispose;
    });
    return () => disposer();
  };
}

export const storeFactory: StoreFactory<FelteAccessor<any>> = <Value>(
  initialValue: Value
) => {
  const [signal, setSignal] = createSignal<Value>(initialValue);

  function signalSetter(value: Value) {
    setSignal(() => value);
  }

  function signalUpdater(updater: (value: Value) => Value) {
    signalSetter(updater(signal()));
  }

  const subscribe = createSubscriber<Value>(signal);

  const accessor = createAccessor(signal) as any;

  accessor.subscribe = subscribe;
  accessor.set = signalSetter;
  accessor.update = signalUpdater;

  return accessor;
};
