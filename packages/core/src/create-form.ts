import type {
  Form,
  FormConfig,
  FormConfigWithTransformFn,
  FormConfigWithoutTransformFn,
  ExtenderHandler,
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
import { executeTransforms } from '@felte/common';
import { createHelpers } from './helpers';
import { createFormAction } from './create-form-action';
import type { FormActionConfig } from './create-form-action';
import { createStores } from './stores';
import { deepSetKey } from './deep-set-key';

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

  const _getCurrentExtenders = () => currentExtenders;
  const _setCurrentExtenders = (extenders: ExtenderHandler<Data>[]) => {
    currentExtenders = extenders;
  };

  const {
    isSubmitting,
    isValidating,
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
    interacted,
  } = createStores(adapters.storeFactory, config);
  const originalUpdate = data.update;
  const originalSet = data.set;

  const transUpdate: typeof data.update = (updater) =>
    originalUpdate((values) =>
      deepSetKey(executeTransforms(updater(values), config.transform))
    );
  const transSet: typeof data.set = (values) =>
    originalSet(deepSetKey(executeTransforms(values, config.transform)));

  data.update = transUpdate;
  data.set = transSet;

  const helpers = createHelpers<Data>({
    extender,
    config,
    addValidator,
    addTransformer,
    validateErrors,
    validateWarnings,
    _getCurrentExtenders,
    stores: {
      data,
      errors,
      warnings,
      touched,
      isValid,
      isValidating,
      isSubmitting,
      isDirty,
      interacted,
    },
  });

  const { createSubmitHandler, handleSubmit } = helpers.public;

  currentExtenders = extender.map((extender) =>
    extender({
      stage: 'SETUP',
      errors,
      warnings,
      touched,
      data,
      isDirty,
      isValid,
      isValidating,
      isSubmitting,
      interacted,
      config,
      addValidator,
      addTransformer,
      setFields: helpers.public.setFields,
      reset: helpers.public.reset,
      validate: helpers.public.validate,
      handleSubmit,
      createSubmitHandler,
    })
  );

  const formActionConfig: FormActionConfig<Data> = {
    config,
    stores: {
      data,
      touched,
      errors,
      warnings,
      isSubmitting,
      isValidating,
      isValid,
      isDirty,
      interacted,
    },
    createSubmitHandler,
    handleSubmit,
    helpers: {
      ...helpers.public,
      addTransformer,
      addValidator,
    },
    extender,
    _getCurrentExtenders,
    _setCurrentExtenders,
    ...helpers.private,
  };

  const { form } = createFormAction<Data>(formActionConfig);

  return {
    data,
    errors,
    warnings,
    touched,
    isValid,
    isSubmitting,
    isValidating,
    isDirty,
    interacted,
    form,
    cleanup,
    startStores: start,
    ...helpers.public,
  };
}
