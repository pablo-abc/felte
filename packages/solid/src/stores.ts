import {
  deepSet,
  deepSome,
  executeValidation,
  _cloneDeep,
  _isPlainObject,
  _mergeWith,
} from '@felte/core';
import type { SetStoreFunction, Store } from 'solid-js/store';
import type { Accessor } from 'solid-js';
import type { Errors, FormConfig, Touched, Obj } from '@felte/core';
import { createEffect, createSignal, createRoot, batch } from 'solid-js';
import { createStore, reconcile } from 'solid-js/store';

type Observable<T> = {
  subscribe: (fn: (value: T) => void) => () => void;
  update: (updater: (value: T) => T) => void;
  set: (value: T) => void;
};

type StoreObservable<T> = {
  getter: () => Store<T>;
  setter: SetStoreFunction<T>;
} & Observable<T>;

type AccessorObservable<T> = {
  getter: () => Accessor<T>;
  setter?: ((v: T) => void) | ((fn: (v: T) => T) => void);
} & Observable<T>;

export type Observables<Data extends Obj> = {
  data: StoreObservable<Data>;
  errors: StoreObservable<Errors<Data>>;
  touched: StoreObservable<Touched<Data>>;
  isValid: Pick<AccessorObservable<boolean>, 'subscribe' | 'getter'>;
  isSubmitting: AccessorObservable<boolean>;
  isDirty: AccessorObservable<boolean>;
};

export function createStores<Data extends Obj>(
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

  const [dataStore, setData] = createStore<Data>(
    config.initialValues ? _cloneDeep(config.initialValues) : ({} as Data)
  );

  const [errorStore, setErrors] = createStore<Errors<Data>>({} as Errors<Data>);

  const [resultErrors, setResultErrors] = createStore<Errors<Data>>(
    initialErrors
  );

  const [touchedStore, setTouched] = createStore<Touched<Data>>(initialTouched);

  async function validate($data?: Data) {
    let errors: Errors<Data> | undefined = {};
    if (!config.validate || !$data) return;
    errors = await executeValidation($data, config.validate);
    errorsSetter(errors || {});
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
      const value = typeof store === 'function' ? store : () => store;
      fn(value());
      let disposer: () => void | undefined;
      createRoot((dispose) => {
        disposer = dispose;
        createEffect(() => fn(value()));
      });
      return () => disposer?.();
    };
  }

  const [isSubmittingStore, setIsSubmitting] = createSignal(false);

  const [isDirtyStore, setIsDirty] = createSignal(false);

  const subscribeData = createSubscriber<Data>(dataStore);

  function dataSetter(data: Data) {
    batch(() => {
      setData(data);
      setData(reconcile(data));
    });
    validate(data);
  }

  function dataUpdater(updater: (data: Data) => Data) {
    const data = updater(dataStore);
    batch(() => {
      setData(data);
      setData(reconcile(data));
    });
    validate(data);
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
    setResultErrors(mergedErrors);
  }

  function errorsSetter(errors: Errors<Data>) {
    batch(() => {
      setErrors(errors);
      setErrors(reconcile(errors as any));
    });
    updateIsValidStore(errors);
    updateResultErrorsStore(errors, touchedStore);
  }

  function errorsUpdater(updater: (data: Errors<Data>) => Errors<Data>) {
    const errors = updater(errorStore as Errors<Data>) as any;
    batch(() => {
      setErrors(errors);
      setErrors(reconcile(errors));
    });
    updateIsValidStore(errors);
    updateResultErrorsStore(errors, touchedStore);
  }

  const subscribeTouched = createSubscriber<Touched<Data>>(touchedStore);

  function touchedSetter(touched: Touched<Data>) {
    batch(() => {
      setTouched(touched);
      setTouched(reconcile<Touched<Data>>(touched));
    });
    updateResultErrorsStore(errorStore as Errors<Data>, touched);
  }

  function touchedUpdater(updater: (data: Touched<Data>) => Touched<Data>) {
    const touched = updater(touchedStore as Touched<Data>) as any;
    batch(() => {
      setTouched(touched);
      setTouched(reconcile<Touched<Data>>(touched));
    });
    updateResultErrorsStore(errorStore as Errors<Data>, touched);
  }

  const subscribeIsValid = createSubscriber<boolean>(isValidStore);

  const subscribeIsSubmitting = createSubscriber<boolean>(isSubmittingStore);

  function isSubmittingSetter(data: boolean) {
    setIsSubmitting(data);
  }

  function isSubmittingUpdater(updater: (data: boolean) => boolean) {
    setIsSubmitting(updater(isSubmittingStore()));
  }

  const subscribeIsDirty = createSubscriber<boolean>(isDirtyStore);

  function isDirtySetter(dirty: boolean) {
    setIsDirty(dirty);
  }

  function isDirtyUpdater(updater: (dirty: boolean) => boolean) {
    setIsDirty(updater(isDirtyStore()));
  }

  return {
    data: {
      subscribe: subscribeData,
      set: dataSetter,
      update: dataUpdater,
      getter: () => dataStore,
      setter: setData,
    },
    errors: {
      subscribe: subscribeErrors,
      set: errorsSetter,
      update: errorsUpdater,
      getter: () => resultErrors,
      setter: setErrors,
    },
    touched: {
      subscribe: subscribeTouched,
      set: touchedSetter,
      update: touchedUpdater,
      getter: () => touchedStore,
      setter: setTouched,
    },
    isValid: {
      subscribe: subscribeIsValid,
      getter: () => isValidStore,
    },
    isSubmitting: {
      subscribe: subscribeIsSubmitting,
      set: isSubmittingSetter,
      update: isSubmittingUpdater,
      getter: () => isSubmittingStore,
      setter: setIsSubmitting,
    },
    isDirty: {
      subscribe: subscribeIsDirty,
      set: isDirtySetter,
      update: isDirtyUpdater,
      getter: () => isDirtyStore,
      setter: setIsDirty,
    },
  };
}
