import {
  deepSet,
  deepSome,
  executeValidation,
  _cloneDeep,
  _isPlainObject,
  _mergeWith,
} from '@felte/common';
import type { Errors, FormConfig, Touched, Obj } from '@felte/common';
import { createEffect, createSignal, createRoot } from 'solid-js';
import { createStore, reconcile } from 'solid-js/store';

export function createStores<Data extends Record<string, unknown>>(
  config: FormConfig<Data>
) {
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
    setErrorStore(reconcile((errors as any) || {}));
  }

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
      let disposer;
      createRoot((dispose) => {
        disposer = dispose;
        createEffect(() => {
          fn(value);
        });
      });
      return disposer ?? (() => undefined);
    };
  }

  let firstCalled = false;
  createEffect(() => {
    if (!config.validate) return setIsValidStore(true);
    if (!firstCalled) {
      firstCalled = true;
      return setIsValidStore(false);
    }
    const hasErrors = deepSome(resultErrors, (error) => !!error);
    setIsValidStore(!hasErrors);
  });

  createEffect(() => {
    const errors = _mergeWith<Errors<Data>>(
      errorStore,
      touchedStore,
      errorFilterer
    ) as any;
    setResultErrors(errors);
  });

  const [isSubmittingStore, setIsSubmittingStore] = createSignal(false);

  createEffect(() => {
    validate(dataStore);
  });

  const subscribeData = createSubscriber<Data>(dataStore);

  function setData(data: Data) {
    setDataStore(reconcile(data));
  }

  function updateData(updater: (data: Data) => Data) {
    setDataStore(reconcile(updater(_cloneDeep(dataStore))));
  }

  const subscribeErrors = createSubscriber<Errors<Data>>(
    resultErrors as Errors<Data>
  );

  function setErrors(errors: Errors<Data>) {
    setErrorStore(reconcile(errors as any));
  }

  function updateErrors(updater: (data: Errors<Data>) => Errors<Data>) {
    const errors = updater(_cloneDeep(errorStore as Errors<Data>)) as any;
    setErrorStore(reconcile(errors));
  }

  const subscribeTouched = createSubscriber<Touched<Data>>(touchedStore);

  function setTouched(touched: Touched<Data>) {
    setTouchedStore(reconcile(touched as any) as any);
  }

  function updateTouched(updater: (data: Touched<Data>) => Touched<Data>) {
    setTouchedStore(
      reconcile(updater(_cloneDeep(touchedStore as Touched<Data>)) as any)
    );
  }

  const subscribeIsValid = createSubscriber<boolean>(isValidStore);

  function setIsValid(data: boolean) {
    setIsValidStore(data);
  }

  function updateIsValid(updater: (data: boolean) => boolean) {
    setIsValidStore(updater(isValidStore()));
  }

  const subscribeIsSubmitting = createSubscriber<boolean>(isSubmittingStore);

  function setIsSubmitting(data: boolean) {
    setIsSubmittingStore(data);
  }

  function updateIsSubmitting(updater: (data: boolean) => boolean) {
    setIsSubmittingStore(updater(isSubmittingStore()));
  }

  const stores = {
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
      set: setIsValid,
      update: updateIsValid,
      get: () => isValidStore(),
    },
    isSubmitting: {
      subscribe: subscribeIsSubmitting,
      set: setIsSubmitting,
      update: updateIsSubmitting,
      get: () => isSubmittingStore(),
    },
  };

  return stores;
}
