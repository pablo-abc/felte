import type {
  Errors,
  Extender,
  FieldValue,
  FormConfig,
  Obj,
  Stores,
  Touched,
  ValidationFunction,
  TransformFunction,
  Setter,
  ObjectSetter,
  PartialErrorsSetter,
  AssignableErrors,
  PrimitiveSetter,
  FieldsSetter,
  Helpers,
} from '@felte/common';
import {
  deepSet,
  executeValidation,
  setForm,
  _cloneDeep,
  _get,
  _set,
  _unset,
  _update,
} from '@felte/common';
import { get } from './get';
import { getAllValidators } from './get-validators';

type CreateHelpersOptions<Data extends Obj> = {
  config: FormConfig<Data>;
  stores: Stores<Data>;
  extender: Extender<Data>[];
  addValidator(validator: ValidationFunction<Data>): void;
  addTransformer(transformer: TransformFunction<Data>): void;
};

function addAtIndex<Data extends Obj>(
  storeValue: Data,
  path: string,
  value: any,
  index?: number
) {
  return _update(storeValue, path, (oldValue) => {
    if (!Array.isArray(oldValue)) return oldValue;
    if (typeof index === 'undefined') {
      oldValue.push(value);
    } else {
      oldValue.splice(index, 0, value);
    }
    return oldValue;
  });
}

function isUpdater<T>(value: unknown): value is (value: T) => T {
  return typeof value === 'function';
}

function createSetHelper<Data extends Obj, Path extends string>(
  storeSetter: (
    updater: (value: Errors<Data>) => AssignableErrors<Data>
  ) => void
): PartialErrorsSetter<Data, Path>;
function createSetHelper<Data extends Obj, Path extends string>(
  storeSetter: (updater: (value: Data) => Data) => void
): ObjectSetter<Data, Path>;
function createSetHelper<Data extends boolean>(
  storeSetter: (updater: (value: Data) => Data) => void
): PrimitiveSetter<Data>;
function createSetHelper<Data extends Obj | boolean>(
  storeSetter: (updater: (value: Data) => Data) => void
): Setter<Data> {
  const setHelper = (
    pathOrValue: string | Data | ((value: Data) => Data),
    valueOrUpdater?: unknown | ((value: unknown) => unknown)
  ) => {
    if (typeof pathOrValue === 'string') {
      const path = pathOrValue;
      storeSetter((oldValue) => {
        const newValue = isUpdater(valueOrUpdater)
          ? (valueOrUpdater(_get(oldValue as Obj, path)) as Data)
          : valueOrUpdater;
        return _set(
          oldValue as Obj,
          path,
          newValue as FieldValue | FieldValue[]
        ) as Data;
      });
    } else {
      storeSetter((oldValue) =>
        isUpdater<Data>(pathOrValue) ? pathOrValue(oldValue) : pathOrValue
      );
    }
  };

  return setHelper as Setter<Data>;
}

export function createHelpers<Data extends Obj>({
  stores,
  config,
}: CreateHelpersOptions<Data>) {
  let formNode: HTMLFormElement | undefined;
  let initialValues = (config.initialValues ?? {}) as Data;

  const { data, touched, errors, warnings, isDirty, isSubmitting } = stores;

  const setData = createSetHelper<Data, string>(data.update);

  const setTouched = createSetHelper<Touched<Data>, string>(touched.update);

  const setErrors = createSetHelper<Data, string>(errors.update);

  const setWarnings = createSetHelper<Data, string>(warnings.update);

  function updateFields(updater: (values: Data) => Data) {
    setData((oldData) => {
      const newData = updater(oldData);
      if (formNode) setForm(formNode, newData);
      return newData;
    });
  }

  const setFields: FieldsSetter<Data, string> = (
    pathOrValue: string | Data | ((value: Data) => Data),
    valueOrUpdater?: unknown | ((value: unknown) => unknown),
    shouldTouch?: boolean
  ) => {
    const fieldsSetter = createSetHelper<Data, string>(updateFields);
    fieldsSetter(pathOrValue as any, valueOrUpdater as any);
    if (typeof pathOrValue === 'string' && shouldTouch) {
      setTouched<string, any>(pathOrValue, true);
    }
  };

  function unsetField(path: string) {
    data.update(($data) => {
      const newData = _unset($data, path);
      if (formNode) setForm(formNode, newData);
      return newData;
    });
    touched.update(($touched) => {
      return _unset($touched, path);
    });
    errors.update(($errors) => {
      return _unset($errors, path);
    });
    warnings.update(($warnings) => {
      return _unset($warnings, path);
    });
  }

  function addField(
    path: string,
    value: FieldValue | FieldValue[],
    index?: number
  ) {
    errors.update(($errors) => {
      return addAtIndex($errors, path, [], index);
    });
    warnings.update(($warnings) => {
      return addAtIndex($warnings, path, [], index);
    });
    touched.update(($touched) => {
      return addAtIndex($touched, path, false, index);
    });
    data.update(($data) => {
      const newData = addAtIndex($data, path, value, index);
      setTimeout(() => formNode && setForm(formNode, newData));
      return newData;
    });
  }

  function resetField(path: string) {
    const initialValue = _get(initialValues, path);
    data.update(($data) => {
      const newData = _set($data, path, initialValue);
      if (formNode) setForm(formNode, newData);
      return newData;
    });
    touched.update(($touched) => {
      return _set($touched, path, false);
    });
    errors.update(($errors) => {
      return _set($errors, path, []);
    });
    warnings.update(($warnings) => {
      return _set($warnings, path, []);
    });
  }

  const setIsSubmitting = createSetHelper(isSubmitting.update);

  const setIsDirty = createSetHelper(isDirty.update);

  async function validate(): Promise<Errors<Data> | void> {
    const validate = getAllValidators('validate', config);
    const warn = getAllValidators('warn', config);
    const currentData = get(data);
    const shape = deepSet(get(touched), []) as Errors<Data>;
    setTouched((t) => {
      return deepSet<Touched<Data>, boolean>(t, true) as Touched<Data>;
    });
    const currentErrors = await executeValidation<Data>(
      currentData,
      shape,

      validate
    );
    const currentWarnings = await executeValidation(currentData, shape, warn);
    warnings.set(currentWarnings || shape);
    errors.set(currentErrors || shape);
    return currentErrors;
  }

  function reset(): void {
    setFields(_cloneDeep(initialValues));
    setTouched(($touched) => deepSet($touched, false) as Touched<Data>);
    isDirty.set(false);
  }

  const publicHelpers: Helpers<Data> = {
    setData,
    setFields,
    setTouched,
    setErrors,
    setWarnings,
    setIsSubmitting,
    setIsDirty,
    validate,
    reset,
    unsetField,
    resetField,
    addField,
    setInitialValues: (values: Data) => {
      initialValues = values;
    },
  };

  const privateHelpers = {
    _setFormNode(node: HTMLFormElement) {
      formNode = node;
    },
    _getFormNode: () => formNode,
    _getInitialValues: () => initialValues,
  };

  return {
    public: publicHelpers,
    private: privateHelpers,
  };
}
