import { _cloneDeep, _isPlainObject, _mergeWith } from '@felte/core';
import { createEffect, createSignal, createRoot, batch } from 'solid-js';
import { createStore, reconcile } from 'solid-js/store';

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
    return () => disposer?.();
  };
}

export const storeFactory = <Value>(initialValue: Value) => {
  if (!_isPlainObject(initialValue)) {
    const [signal, setSignal] = createSignal<Value>(initialValue);

    function signalSetter(value: Value) {
      setSignal(() => value);
    }

    function signalUpdater(updater: (value: Value) => Value) {
      signalSetter(updater(signal()));
    }
    return {
      subscribe: createSubscriber<Value>(signal),
      update: signalUpdater,
      set: signalSetter,
      getSolidValue: () => signal,
    };
  }
  const [store, setStore] = createStore<Value>(initialValue);

  function storeSetter(value: Value) {
    batch(() => {
      setStore(value);
      setStore(reconcile(value));
    });
  }

  function storeUpdater(updater: (value: Value) => Value) {
    const updatedStore = updater(store) as Value;
    storeSetter(updatedStore);
  }

  return {
    subscribe: createSubscriber<Value>(store),
    update: storeUpdater,
    set: storeSetter,
    getSolidValue: () => store,
  };
};
