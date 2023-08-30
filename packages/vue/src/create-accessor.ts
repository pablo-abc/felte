import {
  Obj,
  Errors,
  Touched,
  TransWritable,
  Traverse,
  Paths,
  Keyed,
  KeyedWritable,
  Writable,
  Readable,
  getValueFromStore,
} from '@felte/core';
import { getValue, isEqual } from '@felte/core';
import { shallowRef, readonly, onMounted, onUnmounted, type Ref } from 'vue';

export type FelteAccessor<T> = T extends Obj
  ? (<R>(selector: (storeValue: T) => R) => Ref<R>) &
      (<
        P extends Paths<T> = Paths<T>,
        V extends Traverse<T, P> = Traverse<T, P>
      >(
        path: P
      ) => Ref<V>) &
      (() => Ref<T>)
  : T extends boolean | string | null
  ? (<R>(deriveFn: (storeValue: T) => R) => Ref<R>) & (() => Ref<T>)
  : ((selector: (storeValue: any) => any) => any) &
      ((path: string) => any) &
      (() => any);

export type UnknownStores<Data extends Obj> = Omit<Stores<Data>, 'data'> & {
  data: FelteAccessor<Keyed<Data>> & TransWritable<Data>;
};

export type KnownStores<Data extends Obj> = Omit<Stores<Data>, 'data'> & {
  data: FelteAccessor<Keyed<Data>> & KeyedWritable<Data>;
};

export type Stores<Data extends Obj> = {
  data: FelteAccessor<Keyed<Data>> & KeyedWritable<Data>;
  errors: FelteAccessor<Errors<Data>> & Writable<Errors<Data>>;
  warnings: FelteAccessor<Errors<Data>> & Writable<Errors<Data>>;
  touched: FelteAccessor<Touched<Data>> & Writable<Touched<Data>>;
  isSubmitting: FelteAccessor<boolean> & Writable<boolean>;
  isValid: FelteAccessor<boolean> & Readable<boolean>;
  isDirty: FelteAccessor<boolean> & Writable<boolean>;
  isValidating: FelteAccessor<boolean> & Readable<boolean>;
  interacted: FelteAccessor<string | null> & Writable<string | null>;
};

type SelectorOrPath<T, R> = string | ((value: T) => R);

function isWritable<T>(store: Readable<T>): store is Writable<T> {
  return !!(store as any).set;
}

export function createAccessor<T>(
  store: Writable<T>
): FelteAccessor<T> & Writable<T>;
export function createAccessor<T>(
  store: Readable<T>
): FelteAccessor<T> & Readable<T>;
export function createAccessor<T, R>(
  store: Readable<T> | Writable<T>
): FelteAccessor<T> & (Readable<T> | Writable<T>) {
  const storeRef = shallowRef(getValueFromStore(store));
  let cleanup: () => void;
  const subscribed: Record<string, SelectorOrPath<T, R>> = {};
  const signals: Record<string, Ref> = {};
  const felteAccessor = ((selectorOrPath?: SelectorOrPath<T, R>) => {
    if (!selectorOrPath) return readonly(storeRef);
    if (!subscribed[selectorOrPath.toString()]) {
      const valueSignal = shallowRef(
        getValue(storeRef.value, selectorOrPath) as unknown
      );
      signals[selectorOrPath.toString()] = valueSignal;
      subscribed[selectorOrPath.toString()] = selectorOrPath;
    }
    return readonly(signals[selectorOrPath.toString()]);
  }) as FelteAccessor<T> & Writable<T>;

  onMounted(() => {
    cleanup = store.subscribe((value) => {
      storeRef.value = value as any;
      const keys = Object.keys(subscribed);
      for (const key of keys) {
        const subscriber = subscribed[key];
        const newValue = getValue(value, subscriber) as unknown;
        const ref = signals[subscriber.toString()];
        if (isEqual(newValue, ref.value)) continue;
        ref.value = newValue;
      }
    });
  });

  onUnmounted(() => {
    cleanup?.();
  });

  felteAccessor.subscribe = store.subscribe;
  if (isWritable(store)) {
    felteAccessor.set = store.set;
    felteAccessor.update = store.update;
  }

  return felteAccessor;
}
