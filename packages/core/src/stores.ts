import type {
  StoreFactory,
  Obj,
  FormConfig,
  Errors,
  Touched,
  ValidationFunction,
} from '@felte/common';
import type { Writable, Readable, Unsubscriber } from 'svelte/store';
import {
  _cloneDeep,
  deepSet,
  _isPlainObject,
  _mergeWith,
  runValidations,
  mergeErrors,
  executeTransforms,
  deepSome,
} from '@felte/common';

function createAbortController() {
  const signal = { aborted: false };
  return {
    signal,
    abort() {
      signal.aborted = true;
    },
  };
}

function errorFilterer(
  errValue?: string | string[],
  touchValue?: boolean | boolean[]
) {
  if (_isPlainObject(touchValue)) return;
  if (Array.isArray(touchValue)) {
    if (touchValue.some(_isPlainObject)) return;
    const errArray = Array.isArray(errValue) ? errValue : [];
    return touchValue.map((value, index) => (value && errArray[index]) || null);
  }
  return (touchValue && errValue) || null;
}

function filterErrors<Data extends Obj>([errors, touched]: [
  Errors<Data>,
  Touched<Data>
]) {
  return _mergeWith<Errors<Data>>(errors, touched, errorFilterer);
}

function debounce<T extends unknown[]>(
  this: any,
  func: (...v: T) => any,
  timeout = 300
) {
  let timer: NodeJS.Timeout;
  return (...args: T) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, timeout);
  };
}

function cancellableValidation<Data extends Obj>(
  store: Writable<Errors<Data>>
) {
  let activeController: ReturnType<typeof createAbortController> | undefined;
  return async function executeValidations(
    $data?: Data,
    validations?: ValidationFunction<Data>[] | ValidationFunction<Data>
  ) {
    if (!validations || !$data) return;
    let current = deepSet($data, null) as Errors<Data>;
    const controller = createAbortController();
    if (activeController) activeController.abort();
    activeController = controller;
    const results = runValidations($data, validations);
    results.forEach(async (promise) => {
      const result = await promise;
      if (controller.signal.aborted) return;
      current = mergeErrors([current, result]);
      store.set(current);
    });
  };
}

type Readables =
  | Readable<any>
  | [Readable<any>, ...Array<Readable<any>>]
  | Array<Readable<any>>;

type ReadableValues<T> = T extends Readable<infer U>
  ? [U]
  : { [K in keyof T]: T[K] extends Readable<infer U> ? U : never };

type PossibleWritable<T> = Readable<T> & {
  update?: (updater: (v: T) => T) => void;
  set?: (v: T) => void;
};

export function createDerivedFactory<StoreExt = Record<string, any>>(
  storeFactory: StoreFactory<StoreExt>
) {
  return function derived<R, T extends Readables = Readables>(
    storeOrStores: T,
    deriver: (values: ReadableValues<T>) => R,
    initialValue: R
  ): [PossibleWritable<R> & StoreExt, () => void, () => void] {
    const stores: Readable<any>[] = Array.isArray(storeOrStores)
      ? storeOrStores
      : [storeOrStores];
    const values: any[] = new Array(stores.length);
    const derivedStore: PossibleWritable<R> & StoreExt = storeFactory(
      initialValue
    );

    const storeSet = derivedStore.set as Writable<R>['set'];
    const storeSubscribe = derivedStore.subscribe;
    let unsubscribers: Unsubscriber[] | undefined;

    function startStore() {
      unsubscribers = stores.map((store, index) => {
        return store.subscribe(($store: any) => {
          values[index] = $store;
          storeSet(deriver(values as ReadableValues<T>));
        });
      });
    }

    function stopStore() {
      unsubscribers?.forEach((unsub) => unsub());
    }

    derivedStore.subscribe = function subscribe(
      subscriber: (value: R) => void
    ) {
      const unsubscribe = storeSubscribe(subscriber);
      return () => {
        unsubscribe();
      };
    };

    return [derivedStore, startStore, stopStore];
  };
}

export function createStores<Data extends Obj, StoreExt = Record<string, any>>(
  storeFactory: StoreFactory<StoreExt>,
  config: FormConfig<Data> & { preventStoreStart?: boolean }
) {
  const derived = createDerivedFactory(storeFactory);
  const initialValues = config.initialValues
    ? executeTransforms(
        _cloneDeep(config.initialValues as Data),
        config.transform
      )
    : ({} as Data);
  const data = storeFactory(initialValues);

  const initialErrors = deepSet(initialValues, null) as Errors<Data>;
  const immediateErrors = storeFactory(initialErrors);
  const debouncedErrors = storeFactory(_cloneDeep(initialErrors));
  const [errors, startErrors, stopErrors] = derived<Errors<Data>>(
    [
      immediateErrors as Readable<Errors<Data>>,
      debouncedErrors as Readable<Errors<Data>>,
    ],
    mergeErrors,
    _cloneDeep(initialErrors)
  );

  const initialWarnings = deepSet(initialValues, null) as Errors<Data>;
  const immediateWarnings = storeFactory(initialWarnings);
  const debouncedWarnings = storeFactory(_cloneDeep(initialWarnings));
  const [warnings, startWarnings, stopWarnings] = derived<Errors<Data>>(
    [
      immediateWarnings as Readable<Errors<Data>>,
      debouncedWarnings as Readable<Errors<Data>>,
    ],
    mergeErrors,
    _cloneDeep(initialWarnings)
  );

  const initialTouched = deepSet<Data, boolean>(
    initialValues,
    false
  ) as Touched<Data>;
  const touched = storeFactory(initialTouched);

  const [filteredErrors, startFilteredErrors, stopFilteredErrors] = derived(
    [errors as Readable<Errors<Data>>, touched as Readable<Touched<Data>>],
    filterErrors,
    _cloneDeep(initialErrors)
  );

  const [isValid, startIsValid, stopIsValid] = derived(
    errors,
    ([$errors]) => !deepSome($errors, (error) => !!error),
    !config.validate
  );

  delete isValid.set;
  delete isValid.update;

  const isSubmitting = storeFactory(false);

  const isDirty = storeFactory(false);

  const validateErrors = cancellableValidation(immediateErrors);
  const validateWarnings = cancellableValidation(immediateWarnings);
  const validateDebouncedErrors = debounce(
    cancellableValidation(debouncedErrors),
    config.debounced?.validateTimeout ?? config.debounced?.timeout
  );
  const validateDebouncedWarnings = debounce(
    cancellableValidation(debouncedWarnings),
    config.debounced?.warnTimeout ?? config.debounced?.timeout
  );

  function start() {
    const dataUnsubscriber = data.subscribe(($data) => {
      validateErrors($data, config.validate);
      validateWarnings($data, config.warn);
      debouncedErrors.set({} as Errors<Data>);
      validateDebouncedErrors($data, config.debounced?.validate);
      debouncedWarnings.set({} as Errors<Data>);
      validateDebouncedWarnings($data, config.debounced?.warn);
    });

    startErrors();
    startIsValid();
    startWarnings();
    startFilteredErrors();

    function cleanup() {
      dataUnsubscriber();
      stopFilteredErrors();
      stopErrors();
      stopWarnings();
      stopIsValid();
    }
    return cleanup;
  }

  filteredErrors.set = immediateErrors.set;
  filteredErrors.update = immediateErrors.update;
  warnings.set = immediateWarnings.set;
  warnings.update = immediateWarnings.update;

  return {
    data,
    errors: filteredErrors as Writable<Errors<Data>> & StoreExt,
    warnings: warnings as Writable<Errors<Data>> & StoreExt,
    touched,
    isValid,
    isSubmitting,
    isDirty,
    cleanup: config.preventStoreStart ? () => undefined : start(),
    start,
  };
}
