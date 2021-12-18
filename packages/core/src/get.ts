import type { Readable } from 'svelte/store';

function subscribe(store: any, ...callbacks: any[]) {
  if (store == null) {
    return () => undefined;
  }
  const unsub = store.subscribe(...callbacks);
  return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
}

export function get<Data>(store: Readable<Data>): Data {
  let value: Data | undefined = undefined;
  subscribe(store, (_: Data) => (value = _))();
  return (value as unknown) as Data;
}
