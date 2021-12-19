import type { Readable } from 'svelte/store';

function subscribe(store: any, ...callbacks: any[]) {
  const unsub = store.subscribe(...callbacks);
  return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
}

type Store<Data> =
  | Readable<Data>
  | {
      subscribe(subscriber: (value: Data) => void): { unsubscribe(): void };
    };

export function get<Data>(store: Store<Data>): Data {
  let value: Data | undefined = undefined;
  subscribe(store, (_: Data) => (value = _))();
  return (value as unknown) as Data;
}
