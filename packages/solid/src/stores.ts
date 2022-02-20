import type { StoreFactory } from '@felte/core';
import type { FelteAccessor } from './create-accessor';
import type { Writable } from 'svelte/store';
import { createSignal, createRoot, createEffect } from 'solid-js';
import { createAccessor } from './create-accessor';

function createSubscriber<T>(signal: () => T) {
  return function subscribe(fn: (data: T) => void) {
    return createRoot((dispose) => {
      createEffect(() => fn(signal()));
      return dispose;
    });
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
    setSignal(updater as any);
  }

  const accessor = (createAccessor(signal) as unknown) as Writable<any> &
    FelteAccessor<any>;

  const subscribe = createSubscriber(signal);

  accessor.subscribe = subscribe;
  accessor.set = signalSetter;
  accessor.update = signalUpdater;

  return accessor;
};
