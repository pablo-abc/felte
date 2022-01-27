import type {
  StoreFactory,
  Obj,
  FormConfig,
  Errors,
  Touched,
  ValidationFunction,
  PartialWritableErrors,
  AssignableErrors,
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

type ValidationController = {
  signal: {
    readonly aborted: boolean;
    readonly priority: boolean;
  };
  abort(): void;
};

function createValidationController(priority: boolean): ValidationController {
  const signal = { aborted: false, priority };
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
    return touchValue.map((value, index) => {
      const err = errArray[index];
      if (Array.isArray(err) && err.length === 0) return null;
      return (value && err) || null;
    });
  }
  if (Array.isArray(errValue) && errValue.length === 0) return null;
  if (Array.isArray(errValue)) return touchValue ? errValue : null;
  return touchValue && errValue ? [errValue] : null;
}

function warningFilterer(
  errValue?: string | string[],
  touchValue?: boolean | boolean[]
) {
  if (_isPlainObject(touchValue)) return;
  if (Array.isArray(touchValue)) {
    if (touchValue.some(_isPlainObject)) return;
    const errArray = Array.isArray(errValue) ? errValue : [];
    return touchValue.map((_, index) => {
      const err = errArray[index];
      if (Array.isArray(err) && err.length === 0) return null;
      return err || null;
    });
  }
  if (Array.isArray(errValue) && errValue.length === 0) return null;
  if (Array.isArray(errValue)) return errValue;
  return errValue ? [errValue] : null;
}

function filterErrors<Data extends Obj>([errors, touched]: [
  Errors<Data>,
  Touched<Data>
]) {
  return _mergeWith<Errors<Data>>(errors, touched, errorFilterer);
}

function filterWarnings<Data extends Obj>([errors, touched]: [
  Errors<Data>,
  Touched<Data>
]) {
  return _mergeWith<Errors<Data>>(errors, touched, warningFilterer);
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
  store: PartialWritableErrors<Data>
) {
  let activeController: ValidationController | undefined;
  return async function executeValidations(
    $data: Data,
    shape: Errors<Data>,
    validations?: ValidationFunction<Data>[] | ValidationFunction<Data>,
    priority = false
  ) {
    if (!validations || !$data) return;
    let current = shape;
    const controller = createValidationController(priority);
    if (!activeController?.signal.priority || priority) {
      activeController?.abort();
      activeController = controller;
    }
    if (activeController.signal.priority && !priority) return;
    const results = runValidations($data, validations);
    results.forEach(async (promise: any) => {
      const result = await promise;
      if (controller.signal.aborted) return;
      current = mergeErrors([current, result]);
      store.set(current);
    });
    await Promise.all(results);
    activeController = undefined;
    return current;
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
  let storesShape = deepSet(initialValues, []) as Errors<Data>;
  const data = storeFactory(initialValues);

  const initialErrors = deepSet(initialValues, []) as Errors<Data>;
  const immediateErrors = storeFactory(
    initialErrors
  ) as PartialWritableErrors<Data> & StoreExt;
  const debouncedErrors = storeFactory(
    _cloneDeep(initialErrors)
  ) as PartialWritableErrors<Data> & StoreExt;
  const [errors, startErrors, stopErrors] = derived<Errors<Data>>(
    [
      immediateErrors as Readable<Errors<Data>>,
      debouncedErrors as Readable<Errors<Data>>,
    ],
    mergeErrors,
    _cloneDeep(initialErrors)
  );

  const initialWarnings = deepSet(initialValues, []) as Errors<Data>;
  const immediateWarnings = storeFactory(
    initialWarnings
  ) as PartialWritableErrors<Data> & StoreExt;
  const debouncedWarnings = storeFactory(
    _cloneDeep(initialWarnings)
  ) as PartialWritableErrors<Data> & StoreExt;
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

  const [
    filteredWarnings,
    startFilteredWarnings,
    stopFilteredWarnings,
  ] = derived(
    [warnings as Readable<Errors<Data>>, touched as Readable<Touched<Data>>],
    filterWarnings,
    _cloneDeep(initialWarnings)
  );

  let firstCalled = false;
  const [isValid, startIsValid, stopIsValid] = derived(
    errors,
    ([$errors]) => {
      if (!firstCalled) {
        firstCalled = true;
        return !config.validate && !config.debounced?.validate;
      } else {
        return !deepSome($errors, (error) =>
          Array.isArray(error) ? error.length >= 1 : !!error
        );
      }
    },
    !config.validate && !config.debounced?.validate
  );

  delete isValid.set;
  delete isValid.update;

  const isSubmitting = storeFactory(false);

  const isDirty = storeFactory(false);

  const validateErrors = cancellableValidation(immediateErrors);
  const validateWarnings = cancellableValidation(immediateWarnings);
  const validateDebouncedErrors = cancellableValidation(debouncedErrors);
  const validateDebouncedWarnings = cancellableValidation(debouncedWarnings);
  const _validateDebouncedErrors = debounce(
    validateDebouncedErrors,
    config.debounced?.validateTimeout ?? config.debounced?.timeout
  );
  const _validateDebouncedWarnings = debounce(
    validateDebouncedWarnings,
    config.debounced?.warnTimeout ?? config.debounced?.timeout
  );

  async function executeErrorsValidation(
    data: Data,
    altValidate?: ValidationFunction<Data> | ValidationFunction<Data>[]
  ): Promise<Errors<Data> | undefined> {
    const errors = validateErrors(
      data,
      storesShape,
      altValidate ?? config.validate,
      true
    );
    if (altValidate) return errors;
    const debouncedErrors = validateDebouncedErrors(
      data,
      storesShape,
      config.debounced?.validate,
      true
    );
    return mergeErrors<Errors<Data>>(
      await Promise.all([errors, debouncedErrors])
    );
  }

  async function executeWarningsValidation(
    data: Data,
    altWarn?: ValidationFunction<Data> | ValidationFunction<Data>[]
  ): Promise<Errors<Data> | undefined> {
    const warnings = validateWarnings(
      data,
      storesShape,
      altWarn ?? config.warn,
      true
    );
    if (altWarn) return warnings;
    const debouncedWarnings = validateDebouncedWarnings(
      data,
      storesShape,
      config.debounced?.warn,
      true
    );
    return mergeErrors<Errors<Data>>(
      await Promise.all([warnings, debouncedWarnings])
    );
  }

  let errorsValue = initialErrors;
  let warningsValue = initialWarnings;
  function start() {
    const dataUnsubscriber = data.subscribe(($data) => {
      validateErrors($data, storesShape, config.validate);
      validateWarnings($data, storesShape, config.warn);
      _validateDebouncedErrors($data, storesShape, config.debounced?.validate);
      _validateDebouncedWarnings($data, storesShape, config.debounced?.warn);
    });

    const unsubscribeTouched = touched.subscribe(($touched) => {
      storesShape = deepSet($touched, []) as Errors<Data>;
    });
    const unsubscribeErrors = errors.subscribe(($errors) => {
      errorsValue = $errors;
    });
    const unsubscribeWarnings = warnings.subscribe(($warnings) => {
      warningsValue = $warnings;
    });

    startErrors();
    startIsValid();
    startWarnings();
    startFilteredErrors();
    startFilteredWarnings();

    function cleanup() {
      dataUnsubscriber();
      stopFilteredErrors();
      stopErrors();
      stopWarnings();
      stopFilteredWarnings();
      stopIsValid();
      unsubscribeTouched();
      unsubscribeErrors();
      unsubscribeWarnings();
    }
    return cleanup;
  }

  function publicErrorsUpdater(
    updater: (value: Errors<Data>) => AssignableErrors<Data>
  ): void {
    immediateErrors.set(updater(errorsValue));
    debouncedErrors.set({} as AssignableErrors<Data>);
  }

  function publicWarningsUpdater(
    updater: (value: Errors<Data>) => AssignableErrors<Data>
  ): void {
    immediateWarnings.set(updater(warningsValue));
    debouncedWarnings.set({} as AssignableErrors<Data>);
  }

  function publicErrorsSetter(value: AssignableErrors<Data>): void {
    publicErrorsUpdater(() => value);
  }

  function publicWarningsSetter(value: AssignableErrors<Data>): void {
    publicWarningsUpdater(() => value);
  }

  filteredErrors.set = publicErrorsSetter;
  (filteredErrors as PartialWritableErrors<Data>).update = publicErrorsUpdater;
  filteredWarnings.set = publicWarningsSetter;
  (filteredWarnings as PartialWritableErrors<Data>).update = publicWarningsUpdater;

  return {
    data,
    errors: filteredErrors as PartialWritableErrors<Data> & StoreExt,
    warnings: filteredWarnings as PartialWritableErrors<Data> & StoreExt,
    touched,
    isValid,
    isSubmitting,
    isDirty,
    validateErrors: executeErrorsValidation,
    validateWarnings: executeWarningsValidation,
    cleanup: config.preventStoreStart ? () => undefined : start(),
    start,
  };
}
