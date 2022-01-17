import type {
  StoreFactory,
  Obj,
  FormConfig,
  Errors,
  Touched,
} from '@felte/common';
import {
  _cloneDeep,
  deepSet,
  _isPlainObject,
  _mergeWith,
  _merge,
  executeValidation,
  executeTransforms,
  deepSome,
} from '@felte/common';

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

  const filteredErrors = storeFactory(_cloneDeep(initialErrors));

  const filteredErrorsSet = filteredErrors.set;

  const initialWarnings = deepSet(initialValues, null) as Errors<Data>;
  const warnings = storeFactory(initialWarnings);

  const initialTouched: Touched<Data> = deepSet(initialValues, false);
  const touched = storeFactory(initialTouched);

  const isValid = storeFactory(!config.validate);

  const isSubmitting = storeFactory(false);

  const isDirty = storeFactory(false);

  async function validateErrors($data?: Data) {
    let currentErrors: Errors<Data> | undefined = {};
    if (!config.validate || !$data) return;
    currentErrors = await executeValidation($data, config.validate);
    errors.set(currentErrors || {});
  }

  async function validateWarnings($data?: Data) {
    let currentWarnings: Errors<Data> | undefined = {};
    if (!config.warn || !$data) return;
    currentWarnings = await executeValidation($data, config.warn);
    warnings.set(_merge(deepSet($data, null), currentWarnings || {}));
  }

  function start() {
    const dataUnsubscriber = data.subscribe(($data) => {
      validateErrors($data);
      validateWarnings($data);
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
