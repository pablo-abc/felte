import {
  deepSet,
  deepSome,
  executeValidation,
  _cloneDeep,
  _isPlainObject,
  _mergeWith,
} from '@felte/common';
import type { Store } from 'solid-js/store';
import type { Accessor } from 'solid-js';
import type { Errors, FormConfig, Touched, Obj } from '@felte/common';
import { createEffect, createSignal, createRoot } from 'solid-js';
import { createStore, reconcile } from 'solid-js/store';

type Observable<T> = {
  subscribe: (fn: (value: T) => void) => () => void;
  update: (updater: (value: T) => T) => void;
  set: (value: T) => void;
};

type StoreObservable<T> = {
  get: () => Store<T>;
} & Observable<T>;

type AccessorObservable<T> = {
  get: () => Accessor<T>;
} & Observable<T>;

export type Observables<Data extends Obj> = {
  data: StoreObservable<Data>;
  errors: StoreObservable<Errors<Data>>;
  touched: StoreObservable<Touched<Data>>;
  isValid: Pick<AccessorObservable<boolean>, 'subscribe' | 'get'>;
  isSubmitting: AccessorObservable<boolean>;
};

export function createStores<Data extends Record<string, unknown>>(
  config: FormConfig<Data>
): Observables<Data> {
  const initialTouched: Touched<Data> = deepSet<Data, boolean>(
    config.initialValues || ({} as Data),
    false
  );
  const initialErrors: Errors<Data> = deepSet<Data, null>(
    config.initialValues || ({} as Data),
    null
  );

  const [dataStore, setDataStore] = createStore<Data>(
    config.initialValues ? _cloneDeep(config.initialValues) : ({} as Data)
  );

  const [errorStore, setErrorStore] = createStore<Errors<Data>>(
    {} as Errors<Data>
  );

  const [resultErrors, setResultErrors] = createStore<Errors<Data>>(
    initialErrors
  );

  const [touchedStore, setTouchedStore] = createStore<Touched<Data>>(
    initialTouched
  );

  async function validate($data?: Data) {
    let errors: Errors<Data> | undefined = {};
    if (!config.validate || !$data) return;
    errors = await executeValidation($data, config.validate);
    updateResultErrorsStore(errors || {}, touchedStore);
    setErrorStore(reconcile((errors as any) || {}));
  }

  validate(dataStore);

  function errorFilterer(
    errValue?: string | string[],
    touchValue?: boolean | boolean[]
  ) {
    if (_isPlainObject(touchValue)) return;
    if (Array.isArray(touchValue)) {
      if (touchValue.some(_isPlainObject)) return;
      const errArray = Array.isArray(errValue) ? errValue : [];
      return touchValue.map(
        (value, index) => (value && errArray[index]) || null
      );
    }
    return (touchValue && errValue) || null;
  }

  const [isValidStore, setIsValidStore] = createSignal(!config.validate);

  function createSubscriber<T extends Obj | boolean>(store: T | (() => T)) {
    return function subscribe(fn: (data: T) => void) {
      const value = typeof store === 'function' ? store() : store;
      fn(value);
      let disposer: () => void | undefined;
      createRoot((dispose) => {
        disposer = dispose;
        createEffect(() => fn(value));
      });
      return () => disposer?.();
    };
  }

  const [isSubmittingStore, setIsSubmittingStore] = createSignal(false);

  const subscribeData = createSubscriber<Data>(dataStore);

  function setData(data: Data) {
    validate(data);
    setDataStore(reconcile(data));
  }

  function updateData(updater: (data: Data) => Data) {
    const data = _cloneDeep(updater(dataStore));
    validate(data);
    setDataStore(reconcile(data));
  }

  const subscribeErrors = createSubscriber<Errors<Data>>(
    resultErrors as Errors<Data>
  );

  let firstCalled = false;
  function updateIsValidStore(errors: Errors<Data>) {
    if (!config.validate) return;
    if (!firstCalled) {
      firstCalled = true;
      return setIsValidStore(false);
    }
    const hasErrors = deepSome(errors, (error) => !!error);
    setIsValidStore(!hasErrors);
  }

  function updateResultErrorsStore(
    errors: Errors<Data>,
    touched: Touched<Data>
  ) {
    const mergedErrors = _mergeWith<Errors<Data>>(
      errors,
      touched,
      errorFilterer
    ) as any;
    updateIsValidStore(errors);
    setResultErrors(mergedErrors);
  }

  function setErrors(errors: Errors<Data>) {
    updateResultErrorsStore(errors, touchedStore);
    setErrorStore(reconcile(errors as any));
  }

  function updateErrors(updater: (data: Errors<Data>) => Errors<Data>) {
    const errors = updater(_cloneDeep(errorStore as Errors<Data>)) as any;
    updateResultErrorsStore(errors, touchedStore);
    setErrorStore(reconcile(errors));
  }

  const subscribeTouched = createSubscriber<Touched<Data>>(touchedStore);

  function setTouched(touched: Touched<Data>) {
    updateResultErrorsStore(errorStore as Errors<Data>, touched);
    setTouchedStore(reconcile<Touched<Data>>(touched));
  }

  function updateTouched(updater: (data: Touched<Data>) => Touched<Data>) {
    const touched = _cloneDeep(updater(touchedStore as Touched<Data>)) as any;
    updateResultErrorsStore(errorStore as Errors<Data>, touched);
    setTouchedStore(reconcile<Touched<Data>>(touched));
  }

  const subscribeIsValid = createSubscriber<boolean>(isValidStore);

  const subscribeIsSubmitting = createSubscriber<boolean>(isSubmittingStore);

  function setIsSubmitting(data: boolean) {
    setIsSubmittingStore(data);
  }

  function updateIsSubmitting(updater: (data: boolean) => boolean) {
    setIsSubmittingStore(updater(isSubmittingStore()));
  }

  return {
    data: {
      subscribe: subscribeData,
      set: setData,
      update: updateData,
      get: () => dataStore,
    },
    errors: {
      subscribe: subscribeErrors,
      set: setErrors,
      update: updateErrors,
      get: () => resultErrors,
    },
    touched: {
      subscribe: subscribeTouched,
      set: setTouched,
      update: updateTouched,
      get: () => touchedStore,
    },
    isValid: {
      subscribe: subscribeIsValid,
      get: () => isValidStore,
    },
    isSubmitting: {
      subscribe: subscribeIsSubmitting,
      set: setIsSubmitting,
      update: updateIsSubmitting,
      get: () => isSubmittingStore,
    },
  };
}
