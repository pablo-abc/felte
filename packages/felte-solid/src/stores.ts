import { derived, writable } from 'svelte/store';
import {
  deepSet,
  deepSome,
  executeValidation,
  _cloneDeep,
  _isPlainObject,
  _mergeWith,
} from '@felte/common';
import type { Errors, FormConfig, Touched, Stores } from '@felte/common';
import { createEffect, createSignal } from 'solid-js';
import { createStore, reconcile } from 'solid-js/store';

export function createStores<Data extends Record<string, unknown>>(
  config: FormConfig<Data>
) {
  const initialTouched: Touched<Data> = deepSet<Data, boolean>(
    config.initialValues || ({} as Data),
    false
  );

  const [dataStore, setDataStore] = createStore<Data>(
    config.initialValues ? _cloneDeep(config.initialValues) : ({} as Data)
  );
  const [errorStore, setErrorStore] = createStore<Errors<Data>>(
    {} as Errors<Data>
  );

  createEffect(() => {
    async function validate($data?: Data) {
      let errors: Errors<Data> | undefined = {};
      if (!config.validate || !$data) return;
      errors = await executeValidation($data, config.validate);
      setErrorStore(reconcile((errors as any) || {}));
    }
    validate(dataStore);
  });

  const [touchedStore, setTouchedStore] = createStore<Touched<Data>>(
    initialTouched
  );

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

  const [resultErrors, setResultErrors] = createStore<Errors<Data>>(
    _mergeWith<Errors<Data>>(errorStore, touchedStore, errorFilterer)
  );

  const [isValidStore, setIsValidStore] = createSignal(!config.validate);

  let firstCalled = false;
  createEffect(() => {
    if (!config.validate) return setIsValidStore(true);
    if (!firstCalled) {
      firstCalled = true;
      return setIsValidStore(false);
    }
    const hasErrors = deepSome(errorStore, (error) => !!error);
    setIsValidStore(!hasErrors);
  });

  createEffect(() => {
    setResultErrors(
      reconcile(
        _mergeWith<Errors<Data>>(errorStore, touchedStore, errorFilterer) as any
      )
    );
  });

  const [isSubmittingStore, setIsSubmittingStore] = createSignal(false);

  function subscribeData(fn: (data: Data) => void) {
    fn(dataStore);
    createEffect(() => {
      fn(dataStore);
    });
    return () => undefined;
  }

  function setData(data: Data) {
    setDataStore(reconcile(data));
  }

  function updateData(updater: (data: Data) => Data) {
    setDataStore(reconcile(updater(_cloneDeep(dataStore))));
  }

  function subscribeErrors(fn: (errors: Errors<Data>) => void) {
    fn(resultErrors as Errors<Data>);
    createEffect(() => {
      fn(resultErrors as Errors<Data>);
    });
    return () => undefined;
  }

  function setErrors(errors: Errors<Data>) {
    setErrorStore(errors);
  }

  function updateErrors(updater: (data: Errors<Data>) => Errors<Data>) {
    const errors = updater(_cloneDeep(errorStore as Errors<Data>)) as any;
    setErrorStore(reconcile(errors));
  }

  function subscribeTouched(fn: (touched: Touched<Data>) => void) {
    fn(touchedStore);
    createEffect(() => {
      fn(touchedStore);
    });
    return () => undefined;
  }

  function setTouched(touched: Touched<Data>) {
    setTouchedStore(reconcile(touched as any) as any);
  }

  function updateTouched(updater: (data: Touched<Data>) => Touched<Data>) {
    setTouchedStore(
      reconcile(updater(_cloneDeep(touchedStore as Touched<Data>)) as any)
    );
  }

  function subscribeIsValid(fn: (data: boolean) => void) {
    fn(isValidStore());
    createEffect(() => {
      fn(isValidStore());
    });
    return () => undefined;
  }

  function setIsValid(data: boolean) {
    setIsValidStore(data);
  }

  function updateIsValid(updater: (data: boolean) => boolean) {
    setIsValidStore(updater(isValidStore()));
  }

  function subscribeIsSubmitting(fn: (data: boolean) => void) {
    fn(isSubmittingStore());
    createEffect(() => {
      fn(isValidStore());
    });
    return () => undefined;
  }

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

export function createSvelteStores<Data extends Record<string, unknown>>(
  config: FormConfig<Data>
): Stores<Data> {
  const initialTouched: Touched<Data> = deepSet<Data, boolean>(
    config.initialValues || ({} as Data),
    false
  );

  const touched = writable(initialTouched);

  const data = writable(
    config.initialValues ? _cloneDeep(config.initialValues) : ({} as Data)
  );

  const errors = writable(
    {} as Errors<Data>,
    (set: (values: Errors<Data>) => void) => {
      async function validate($data?: Data) {
        let errors: Errors<Data> | undefined = {};
        if (!config.validate || !$data) return;
        errors = await executeValidation($data, config.validate);
        set(errors || {});
      }
      return data.subscribe(validate);
    }
  );

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

  const { subscribe: errorSubscribe } = derived(
    [errors, touched],
    ([$errors, $touched]) => {
      return _mergeWith<Errors<Data>>($errors, $touched, errorFilterer);
    }
  );

  let firstCalled = false;
  const isValid = derived(errors, ($errors) => {
    if (!config.validate) return true;
    if (!firstCalled) {
      firstCalled = true;
      return false;
    }
    const hasErrors = deepSome($errors, (error) => !!error);
    return !hasErrors;
  });

  const isSubmitting = writable(false);

  return {
    touched,
    isSubmitting,
    isValid,
    errors: {
      subscribe: errorSubscribe,
      set: errors.set,
      update: errors.update,
    },
    data,
  };
}
