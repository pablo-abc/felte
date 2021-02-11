import type { Readable, Writable } from 'svelte/store';
import { writable } from 'svelte/store';
import { is_function } from 'svelte/internal';

function subscribe(store: any, ...callbacks: any[]) {
  if (store == null) {
    return () => undefined;
  }
  const unsub = store.subscribe(...callbacks);
  return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
}

type Unsubscriber = () => void;

/** One or more `Readable`s. */
type Stores = Readable<any> | [Readable<any>, ...Array<Readable<any>>];

/** One or more values from `Readable` stores. */
type StoresValues<T> = T extends Readable<infer U>
  ? U
  : { [K in keyof T]: T[K] extends Readable<infer U> ? U : never };

/**
 * Derived value store by synchronizing one or more readable stores and
 * applying an aggregation function over its input values.
 *
 * @param stores - input stores
 * @param fn - function callback that aggregates the values
 * @param initial_value - when used asynchronously
 */
export function writableDerived<S extends Stores, T>(
  stores: S,
  fn: (values: StoresValues<S>, set: (value: T) => void) => Unsubscriber | void,
  initial_value?: T
): Writable<T>;

/**
 * Derived value store by synchronizing one or more readable stores and
 * applying an aggregation function over its input values.
 *
 * @param stores - input stores
 * @param fn - function callback that aggregates the values
 */
export function writableDerived<S extends Stores, T>(
  stores: S,
  fn: (values: StoresValues<S>) => T
): Writable<T>;

export function writableDerived<T>(
  stores: Stores,
  fn: (values: StoresValues<any>, set?: (value: any) => void) => any,
  initial_value?: T
): Writable<T> {
  const single = !Array.isArray(stores);
  const stores_array: Array<Readable<any>> = single
    ? [stores as Readable<any>]
    : (stores as Array<Readable<any>>);

  const auto = fn.length < 2;

  return writable(initial_value, (set) => {
    let inited = false;
    const values = [];

    let pending = 0;
    let cleanup = () => undefined;

    const sync = () => {
      if (pending) {
        return;
      }
      cleanup();
      const result = fn(single ? values[0] : values, set);
      if (auto) {
        set(result as T);
      } else {
        cleanup = is_function(result)
          ? (result as Unsubscriber)
          : () => undefined;
      }
    };

    const unsubscribers = stores_array.map((store, i) =>
      subscribe(
        store,
        (value: any) => {
          values[i] = value;
          pending &= ~(1 << i);
          if (inited) {
            sync();
          }
        },
        () => {
          pending |= 1 << i;
        }
      )
    );

    inited = true;
    sync();

    return function stop() {
      unsubscribers.forEach((fn) => fn());
      cleanup();
    };
  });
}
