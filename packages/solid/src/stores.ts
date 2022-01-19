import type { StoreFactory } from '@felte/core';
import { createSignal, observable } from 'solid-js';
import { createAccessor, FelteAccessor } from './create-accessor';

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

  const accessor = createAccessor(signal) as any;

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
