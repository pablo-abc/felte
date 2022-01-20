import type {
  StoreFactory,
  Obj,
  FormConfig,
  Errors,
  Touched,
  ValidationFunction,
} from '@felte/common';
import type { Writable, Readable } from 'svelte/store';
import {
  _cloneDeep,
  deepSet,
  _isPlainObject,
  _mergeWith,
  _merge,
  runValidations,
  mergeErrors,
  executeTransforms,
  deepSome,
} from '@felte/common';

function createAbort() {
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
  let activeController: ReturnType<typeof createAbort> | undefined;
  return async function executeValidations(
    $data?: Data,
    validations?: ValidationFunction<Data>[] | ValidationFunction<Data>
  ) {
    if (!validations || !$data) return;
    let current: Errors<Data> = {};
    const controller = createAbort();
    if (activeController) activeController.abort();
    activeController = controller;
    const results = runValidations($data, validations);
    results.forEach(async (promise) => {
      const result = await promise;
      if (controller.signal.aborted) return;
      current = mergeErrors([current, result]);
      store.set(_merge(deepSet($data, null), current || {}));
    });
  };
}

function mergeValidationsInto<Data extends Obj>(
  stores: Readable<Errors<Data>>[],
  target: Writable<Errors<Data>>
): () => void {
  const values: Errors<Data>[] = new Array(stores.length).fill({});
  const unsubscribers = stores.map((store, index) => {
    return store.subscribe(($store) => {
      values[index] = $store;
      const merged = mergeErrors(values);
      target.set(merged);
    });
  });
  return () => {
    unsubscribers.forEach((unsub) => unsub());
  };
}

export function createStores<Data extends Obj, StoreExt = Record<string, any>>(
  storeFactory: StoreFactory<StoreExt>,
  config: FormConfig<Data> & { preventStoreStart?: boolean }
) {
  const initialValues = config.initialValues
    ? executeTransforms(
        _cloneDeep(config.initialValues as Data),
        config.transform
      )
    : ({} as Data);
  const data = storeFactory(initialValues);

  const initialErrors = deepSet(initialValues, null) as Errors<Data>;
  const errors = storeFactory(initialErrors);
  const immediateErrors = storeFactory(_cloneDeep(initialErrors));
  const debouncedErrors = storeFactory(_cloneDeep(initialErrors));

  const filteredErrors = storeFactory(_cloneDeep(initialErrors));

  const filteredErrorsSet = filteredErrors.set;

  const initialWarnings = deepSet(initialValues, null) as Errors<Data>;
  const warnings = storeFactory(initialWarnings);
  const immediateWarnings = storeFactory(_cloneDeep(initialWarnings));
  const debouncedWarnings = storeFactory(_cloneDeep(initialWarnings));

  const initialTouched: Touched<Data> = deepSet(initialValues, false);
  const touched = storeFactory(initialTouched);

  const isValid = storeFactory(!config.validate);

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
      debouncedErrors.set({});
      validateDebouncedErrors($data, config.debounced?.validate);
      debouncedWarnings.set({});
      validateDebouncedWarnings($data, config.debounced?.warn);
    });

    let touchedValue = initialTouched;
    let errorsValue = initialErrors;
    let firstCalled = false;
    const errorsUnsubscriber = errors.subscribe(($errors) => {
      if (!firstCalled) {
        firstCalled = true;
        isValid.set(!config.validate);
      } else {
        const hasErrors = deepSome($errors, (error) => !!error);
        isValid.set(!hasErrors);
      }

      errorsValue = $errors;
      const mergedErrors = _mergeWith<Errors<Data>>(
        $errors,
        touchedValue,
        errorFilterer
      );
      filteredErrorsSet(mergedErrors);
    });

    const mergedErrorsUnsubscriber = mergeValidationsInto(
      [immediateErrors, debouncedErrors],
      errors
    );
    const mergedWarningsUnsubscriber = mergeValidationsInto(
      [immediateWarnings, debouncedWarnings],
      warnings
    );
    const touchedUnsubscriber = touched.subscribe(($touched) => {
      touchedValue = $touched;
      const mergedErrors = _mergeWith<Errors<Data>>(
        errorsValue,
        $touched,
        errorFilterer
      );
      filteredErrorsSet(mergedErrors);
    });

    function cleanup() {
      dataUnsubscriber();
      errorsUnsubscriber();
      mergedErrorsUnsubscriber();
      mergedWarningsUnsubscriber();
      touchedUnsubscriber();
    }
    return cleanup;
  }

  filteredErrors.set = errors.set;
  filteredErrors.update = errors.update;

  return {
    data,
    errors: filteredErrors,
    warnings,
    touched,
    isValid,
    isSubmitting,
    isDirty,
    cleanup: config.preventStoreStart ? () => undefined : start(),
    start,
  };
}
