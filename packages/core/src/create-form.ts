import {
  _unset,
  _set,
  _isPlainObject,
  _get,
  _cloneDeep,
  _mergeWith,
  _merge,
  _defaultsDeep,
} from '@felte/common';
import { createHelpers } from './helpers';
import type {
  Form,
  FormConfig,
  FormConfigWithInitialValues,
  FormConfigWithoutInitialValues,
  ExtenderHandler,
  Touched,
  Stores,
  Obj,
  ValidationFunction,
} from '@felte/common';

export type Adapters<Data extends Obj> = {
  stores: Stores<Data>;
};

/**
 * Creates the stores and `form` action to make the form reactive.
 * In order to use auto-subscriptions with the stores, call this function at the top-level scope of the component.
 *
 * @param config - Configuration for the form itself. Since `initialValues` is set, `Data` will not be undefined
 *
 * @category Main
 */
export function createForm<Data extends Obj, Ext extends Obj = Obj>(
  config: FormConfigWithInitialValues<Data> & Ext,
  adapters: Adapters<Data>
): Form<Data>;
/**
 * Creates the stores and `form` action to make the form reactive.
 * In order to use auto-subscriptions with the stores, call this function at the top-level scope of the component.
 *
 * @param config - Configuration for the form itself. Since `initialValues` is not set (when only using the `form` action), `Data` will be undefined until the `form` element loads.
 */
export function createForm<Data extends Obj, Ext extends Obj = Obj>(
  config: FormConfigWithoutInitialValues<Data> & Ext,
  adapters: Adapters<Data>
): Form<Data>;
export function createForm<Data extends Obj, Ext extends Obj = Obj>(
  config: FormConfig<Data> & Ext,
  adapters: Adapters<Data>
): Form<Data> {
  config.extend ??= [];
  config.touchTriggerEvents ??= { change: true, blur: true };
  if (config.validate && !Array.isArray(config.validate))
    config.validate = [config.validate];

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

  const extender = Array.isArray(config.extend)
    ? config.extend
    : [config.extend];

  let currentExtenders: ExtenderHandler<Data>[] = [];
  const { isSubmitting, data, errors, touched, isValid } = adapters.stores;

  currentExtenders = extender.map((extender) =>
    extender({
      errors,
      touched,
      data,
      config,
      addValidator,
    })
  );

  const helpers = createHelpers<Data>({
    currentExtenders,
    extender,
    config,
    addValidator,
    stores: {
      data,
      errors,
      touched,
      isValid,
      isSubmitting,
    },
  });

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
    return data.set(values);
  }

  return {
    data: { ...data, set: newDataSet },
    errors,
    touched,
    isValid,
    isSubmitting,
    ...helpers,
  };
}
