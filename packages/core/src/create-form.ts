import type {
  Form,
  FormConfig,
  FormConfigWithInitialValues,
  FormConfigWithoutInitialValues,
  ExtenderHandler,
  Touched,
  Stores,
  StoreFactory,
  Obj,
  ValidationFunction,
  TransformFunction,
} from '@felte/common';
import {
  _unset,
  _set,
  _isPlainObject,
  _get,
  _cloneDeep,
  _mergeWith,
  _merge,
  _defaultsDeep,
  executeTransforms,
} from '@felte/common';
import { createHelpers } from './helpers';
import { createFormAction } from './create-form-action';
import { createStores } from './stores';

export type Adapters = {
  storeFactory: StoreFactory;
};

type CoreForm<Data extends Obj = any> = Form<Data> & {
  cleanup(): void;
};

/**
 * Creates the stores and `form` action to make the form reactive.
 * In order to use auto-subscriptions with the stores, call this function at the top-level scope of the component.
 *
 * @param config - Configuration for the form itself. Since `initialValues` is set, `Data` will not be undefined
 *
 * @category Main
 */
export function createForm<Data extends Obj = any, Ext extends Obj = any>(
  config: FormConfigWithInitialValues<Data> & Ext,
  adapters: Adapters
): CoreForm<Data>;
/**
 * Creates the stores and `form` action to make the form reactive.
 * In order to use auto-subscriptions with the stores, call this function at the top-level scope of the component.
 *
 * @param config - Configuration for the form itself. Since `initialValues` is not set (when only using the `form` action), `Data` will be undefined until the `form` element loads.
 */
export function createForm<Data extends Obj = any, Ext extends Obj = any>(
  config: FormConfigWithoutInitialValues<Data> & Ext,
  adapters: Adapters
): CoreForm<Data>;
export function createForm<Data extends Obj = any, Ext extends Obj = any>(
  config: FormConfig<Data> & Ext,
  adapters: Adapters
): CoreForm<Data> {
  config.extend ??= [];
  config.touchTriggerEvents ??= { change: true, blur: true };
  if (config.validate && !Array.isArray(config.validate))
    config.validate = [config.validate];

  if (config.transform && !Array.isArray(config.transform))
    config.transform = [config.transform];

  function addValidator(validator: ValidationFunction<Data>) {
    if (!config.validate) {
      config.validate = [validator];
    } else {
      config.validate = [
        ...(config.validate as ValidationFunction<Data>[]),
        validator,
      ];
    }
  }

  function addWarnValidator(validator: ValidationFunction<Data>) {
    if (!config.warn) {
      config.warn = [validator];
    } else {
      config.warn = [...(config.warn as ValidationFunction<Data>[]), validator];
    }
  }

  function addTransformer(transformer: TransformFunction<Data>) {
    if (!config.transform) {
      config.transform = [transformer];
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
  } = createStores(adapters.storeFactory, config);
  const originalUpdate = data.update;
  const originalSet = data.set;

  data.update = (updater) =>
    originalUpdate((values) =>
      executeTransforms(updater(values), config.transform)
    );
  data.set = (values) =>
    originalSet(executeTransforms(values, config.transform));

  const helpers = createHelpers<Data>({
    extender,
    config,
    addValidator,
    addTransformer,
    stores: {
      data,
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
      errors,
      warnings,
      touched,
      data,
      config,
      addValidator,
      addWarnValidator,
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
    return data.set(values);
  }

  const { form, createSubmitHandler, handleSubmit } = createFormAction<Data>({
    config,
    stores: { data, touched, errors, warnings, isSubmitting, isValid, isDirty },
    helpers: {
      ...helpers.public,
      addTransformer,
      addValidator,
      addWarnValidator,
    },
    extender,
    _getCurrentExtenders,
    _setCurrentExtenders,
    ...helpers.private,
  });

  return {
    data: { ...data, set: newDataSet },
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
    ...helpers.public,
  };
}
