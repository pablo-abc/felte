import type {
  Form,
  FormConfig,
  FormConfigWithTransformFn,
  FormConfigWithoutTransformFn,
  ExtenderHandler,
  Touched,
  StoreFactory,
  Obj,
  ValidationFunction,
  TransformFunction,
  UnknownStores,
  Stores,
  KnownStores,
  Helpers,
  UnknownHelpers,
  KnownHelpers,
  ValidatorOptions,
} from '@felte/common';
import {
  _isPlainObject,
  _cloneDeep,
  _mergeWith,
  executeTransforms,
} from '@felte/common';
import { createHelpers } from './helpers';
import { createFormAction } from './create-form-action';
import type { FormActionConfig } from './create-form-action';
import { createStores } from './stores';

export type Adapters<StoreExt = Record<string, any>> = {
  storeFactory: StoreFactory<StoreExt>;
};

export type CoreForm<Data extends Obj = any> = Form<Data> & {
  cleanup(): void;
  startStores(): () => void;
};

export function createForm<
  Data extends Obj = Obj,
  Ext extends Obj = Obj,
  StoreExt = Record<string, any>
>(
  config: FormConfigWithTransformFn<Data> & Ext,
  adapters: Adapters<StoreExt>
): CoreForm<Data> & UnknownHelpers<Data> & UnknownStores<Data, StoreExt>;
export function createForm<
  Data extends Obj = Obj,
  Ext extends Obj = Obj,
  StoreExt = Record<string, any>
>(
  config: FormConfigWithoutTransformFn<Data> & Ext,
  adapters: Adapters<StoreExt>
): CoreForm<Data> & KnownHelpers<Data> & KnownStores<Data, StoreExt>;
export function createForm<
  Data extends Obj = Obj,
  Ext extends Obj = Obj,
  StoreExt = Record<string, any>
>(
  config: FormConfig<Data> & Ext,
  adapters: Adapters<StoreExt>
): CoreForm<Data> & Helpers<Data> & Stores<Data, StoreExt>;
export function createForm<
  Data extends Obj = Obj,
  Ext extends Obj = Obj,
  StoreExt = Record<string, any>
>(
  config: FormConfig<Data> & { preventStoreStart?: boolean } & Ext,
  adapters: Adapters<StoreExt>
): CoreForm<Data> & Helpers<Data> & Stores<Data, StoreExt> {
  config.extend ??= [];
  config.debounced ??= {};
  if (config.validate && !Array.isArray(config.validate))
    config.validate = [config.validate];

  if (config.debounced.validate && !Array.isArray(config.debounced.validate))
    config.debounced.validate = [config.debounced.validate];

  if (config.transform && !Array.isArray(config.transform))
    config.transform = [config.transform];

  if (config.warn && !Array.isArray(config.warn)) config.warn = [config.warn];
  if (config.debounced.warn && !Array.isArray(config.debounced.warn))
    config.debounced.warn = [config.debounced.warn];

  function addValidator(
    validator: ValidationFunction<Data>,
    { debounced, level }: ValidatorOptions = {
      debounced: false,
      level: 'error',
    }
  ) {
    const prop = level === 'error' ? 'validate' : 'warn';
    config.debounced ??= {};
    const validateConfig = debounced ? config.debounced : config;
    if (!validateConfig[prop]) {
      validateConfig[prop] = [validator];
    } else {
      validateConfig[prop] = [
        ...(validateConfig[prop] as ValidationFunction<Data>[]),
        validator,
      ];
    }
  }

  function addTransformer(transformer: TransformFunction<Data>) {
    if (!config.transform) {
      (config as FormConfig<Data>).transform = [transformer];
    } else {
      config.transform = [
        ...(config.transform as TransformFunction<Data>[]),
        transformer,
      ];
    }
  }

  const extender = Array.isArray(config.extend)
    ? config.extend
    : [config.extend];

  let currentExtenders: ExtenderHandler<Data>[] = [];
  const {
    isSubmitting,
    data,
    errors,
    warnings,
    touched,
    isValid,
    isDirty,
    cleanup,
    start,
    validateErrors,
    validateWarnings,
  } = createStores(adapters.storeFactory, config);
  const originalUpdate = data.update;
  const originalSet = data.set;

  const transUpdate: typeof data.update = (updater) =>
    originalUpdate((values) =>
      executeTransforms(updater(values), config.transform)
    );
  const transSet: typeof data.set = (values) =>
    originalSet(executeTransforms(values, config.transform));

  const clonedData = { ...data, set: transSet, update: transUpdate };
  data.update = transUpdate;

  const helpers = createHelpers<Data>({
    extender,
    config,
    addValidator,
    addTransformer,
    validateErrors,
    validateWarnings,
    stores: {
      data: clonedData,
      errors,
      warnings,
      touched,
      isValid,
      isSubmitting,
      isDirty,
    },
  });

  currentExtenders = extender.map((extender) =>
    extender({
      stage: 'SETUP',
      errors,
      warnings,
      touched,
      data: clonedData,
      config,
      addValidator,
      addTransformer,
      setFields: helpers.public.setFields,
      reset: helpers.public.reset,
      validate: helpers.public.validate,
    })
  );

  const _getCurrentExtenders = () => currentExtenders;
  const _setCurrentExtenders = (extenders: ExtenderHandler<Data>[]) => {
    currentExtenders = extenders;
  };
  function dataSetCustomizer(dataValue: unknown, initialValue: unknown) {
    if (_isPlainObject(dataValue)) return;
    return dataValue !== initialValue;
  }

  function dataSetTouchedCustomizer(dataValue: unknown, touchedValue: boolean) {
    if (_isPlainObject(dataValue)) return;
    return touchedValue || dataValue;
  }

  function newDataSet(values: Data) {
    touched.update((current) => {
      const changed = _mergeWith<Touched<Data>>(
        _cloneDeep(values),
        config.initialValues,
        dataSetCustomizer
      );
      return _mergeWith<Touched<Data>>(
        changed,
        current,
        dataSetTouchedCustomizer
      );
    });
    isDirty.set(true);
    return clonedData.set(values);
  }

  const formActionConfig: FormActionConfig<Data> = {
    config,
    stores: {
      data: clonedData,
      touched,
      errors,
      warnings,
      isSubmitting,
      isValid,
      isDirty,
    },
    helpers: {
      ...helpers.public,
      addTransformer,
      addValidator,
    },
    extender,
    validateErrors,
    validateWarnings,
    _getCurrentExtenders,
    _setCurrentExtenders,
    ...helpers.private,
  };

  const { form, createSubmitHandler, handleSubmit } = createFormAction<Data>(
    formActionConfig
  );

  data.set = newDataSet;

  return {
    data,
    errors,
    warnings,
    touched,
    isValid,
    isSubmitting,
    isDirty,
    form,
    handleSubmit,
    createSubmitHandler,
    cleanup,
    startStores: start,
    ...helpers.public,
  };
}
