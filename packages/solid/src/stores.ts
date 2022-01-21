import type { StoreFactory } from '@felte/core';
import type { FelteAccessor } from './create-accessor';
import type { Writable } from 'svelte/store';
import { createSignal, observable } from 'solid-js';
import { createAccessor } from './create-accessor';

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

  const accessor = (createAccessor(signal) as unknown) as Writable<any> &
    FelteAccessor<any>;

  const obs = observable(signal);

  function subscribe(subscriber: (value: Value) => void) {
    const { unsubscribe } = obs.subscribe({ next: subscriber });
    return unsubscribe;
  }

  accessor.subscribe = subscribe;
  accessor.set = signalSetter;
  accessor.update = signalUpdater;

  return accessor;
};
