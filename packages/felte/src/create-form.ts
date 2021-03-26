import _defaultsDeep from 'lodash/defaultsDeep';
import _mergeWith from 'lodash/mergeWith';
import _cloneDeep from 'lodash/cloneDeep';
import { get } from 'svelte/store';
import {
  deepSet,
  deepSome,
  getFormControls,
  getFormDefaultValues,
  getPath,
  setForm,
  isElement,
  isFormControl,
  isInputElement,
  _unset,
  _set,
  _isPlainObject,
  _get,
  Errors,
} from '@felte/common';
import { createStores } from './stores';
import type {
  CreateSubmitHandlerConfig,
  FieldValue,
  Form,
  FormConfig,
  FormConfigWithInitialValues,
  FormConfigWithoutInitialValues,
  FormControl,
  Extender,
  ExtenderHandler,
  Touched,
  Obj,
} from '@felte/common';

/**
 * Creates the stores and `form` action to make the form reactive.
 * In order to use auto-subscriptions with the stores, call this function at the top-level scope of the component.
 *
 * @param config - Configuration for the form itself. Since `initialValues` is set, `Data` will not be undefined
 *
 * @category Main
 */
export function createForm<
  Data extends Record<string, unknown>,
  Ext extends Obj = Obj
>(config: FormConfigWithInitialValues<Data> & Ext): Form<Data>;
/**
 * Creates the stores and `form` action to make the form reactive.
 * In order to use auto-subscriptions with the stores, call this function at the top-level scope of the component.
 *
 * @param config - Configuration for the form itself. Since `initialValues` is not set (when only using the `form` action), `Data` will be undefined until the `form` element loads.
 */
export function createForm<Data extends Record<string, unknown>>(
  config: FormConfigWithoutInitialValues<Data>
): Form<Data | undefined>;
export function createForm<Data extends Record<string, unknown>>(
  config: FormConfig<Data>
): Form<Data | undefined> {
  config.reporter ??= [];
  config.extend ??= [];
  const reporter = Array.isArray(config.reporter)
    ? config.reporter
    : [config.reporter];
  const extender = [
    ...reporter,
    ...(Array.isArray(config.extend) ? config.extend : [config.extend]),
  ];
  let currentExtenders: ExtenderHandler<Data>[] = [];
  const { isSubmitting, data, errors, touched, isValid } = createStores<Data>(
    config
  );
  currentExtenders = extender.map((extender) =>
    extender({
      errors,
      touched,
      data,
      config,
    })
  );

  function createSubmitHandler(altConfig?: CreateSubmitHandlerConfig<Data>) {
    const onSubmit = altConfig?.onSubmit ?? config.onSubmit;
    const validate = altConfig?.validate ?? config.validate;
    const onError = altConfig?.onError ?? config.onError;
    return async function handleSubmit(event?: Event) {
      event?.preventDefault();
      isSubmitting.set(true);
      const currentData = get(data);
      const currentErrors = await validate?.(currentData);
      touched.update((t) => {
        return deepSet<Touched<Data>, boolean>(t, true) as Touched<Data>;
      });
      if (currentErrors) {
        const hasErrors = deepSome(currentErrors, (error) => !!error);
        if (hasErrors) {
          currentExtenders.forEach((extender) =>
            extender?.onSubmitError?.({
              data: currentData,
              errors: currentErrors,
            })
          );
          isSubmitting.set(false);
          return;
        }
      }
      try {
        await onSubmit(currentData);
      } catch (e) {
        if (!onError) throw e;
        const serverErrors = onError(e);
        if (serverErrors) {
          errors.set(serverErrors);
          currentExtenders.forEach((extender) =>
            extender?.onSubmitError?.({
              data: currentData,
              errors: serverErrors,
            })
          );
        }
      } finally {
        isSubmitting.set(false);
      }
    };
  }

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
      const changed = _mergeWith(
        _cloneDeep(values),
        config.initialValues,
        dataSetCustomizer
      );
      return _mergeWith(changed, current, dataSetTouchedCustomizer);
    });
    return data.set(values);
  }

  function setTouched(fieldName: string): void {
    touched.update(($touched) => _set($touched, fieldName, true));
  }

  function setError(path: string, error: string | string[]): void {
    errors.update(($errors) => _set($errors, path, error));
  }

  function setField(path: string, value?: FieldValue, touch = true): void {
    data.update(($data) => _set($data, path, value));
    if (touch) setTouched(path);
  }

  async function validate(): Promise<Errors<Data> | void> {
    const currentData = get(data);
    touched.update((t) => {
      return deepSet<Touched<Data>, boolean>(t, true) as Touched<Data>;
    });
    const currentErrors = await config.validate?.(currentData);
    errors.set(currentErrors || {});
    return currentErrors;
  }

  let formNode: HTMLFormElement | undefined;
  let initialValues = config.initialValues;

  function reset(): void {
    data.set(_cloneDeep(initialValues));
    if (formNode) setForm(formNode, initialValues);
    touched.update(($touched) => deepSet($touched, false) as Touched<Data>);
  }

  const handleSubmit = createSubmitHandler();

  function form(node: HTMLFormElement) {
    function callExtender(extender: Extender<Data>) {
      return extender({
        form: node,
        controls: Array.from(node.elements).filter(isFormControl),
        data,
        errors,
        touched,
        config,
      });
    }
    currentExtenders = extender.map(callExtender);
    node.noValidate = !!config.validate;
    const { defaultData, defaultTouched } = getFormDefaultValues<Data>(node);
    initialValues = _cloneDeep(defaultData);
    formNode = node;
    touched.set(defaultTouched);
    data.set(_cloneDeep(defaultData));

    function setCheckboxValues(target: HTMLInputElement) {
      const checkboxes = node.querySelectorAll(`[name="${target.name}"]`);
      if (checkboxes.length === 1)
        return data.update(($data) =>
          _set($data, getPath(target), target.checked)
        );
      return data.update(($data) =>
        _set(
          $data,
          getPath(target),
          Array.from(checkboxes)
            .filter((el: HTMLInputElement) => el.checked)
            .map((el: HTMLInputElement) => el.value)
        )
      );
    }

    function setRadioValues(target: HTMLInputElement) {
      const radios = node.querySelectorAll(`[name="${target.name}"]`);
      const checkedRadio = Array.from(radios).find(
        (el) => isInputElement(el) && el.checked
      ) as HTMLInputElement | undefined;
      data.update(($data) => _set($data, getPath(target), checkedRadio?.value));
    }

    function setFileValue(target: HTMLInputElement) {
      const files = target.files;
      data.update(($data) =>
        _set(
          $data,
          getPath(target),
          target.multiple ? Array.from(files) : files[0]
        )
      );
    }

    function handleInput(e: InputEvent) {
      const target = e.target;
      if (!isFormControl(target)) return;
      if (['checkbox', 'radio', 'file'].includes(target.type)) return;
      if (!target.name) return;
      setTouched(getPath(target));
      data.update(($data) =>
        _set(
          $data,
          getPath(target),
          target.type.match(/^(number|range)$/) ? +target.value : target.value
        )
      );
    }

    function handleChange(e: Event) {
      const target = e.target;
      if (!isInputElement(target)) return;
      if (!target.name) return;
      setTouched(getPath(target));
      if (target.type === 'checkbox') setCheckboxValues(target);
      if (target.type === 'radio') setRadioValues(target);
      if (target.type === 'file') setFileValue(target);
    }

    function handleBlur(e: Event) {
      const target = e.target;
      if (!isFormControl(target)) return;
      if (!target.name) return;
      setTouched(getPath(target));
    }

    const mutationOptions = { childList: true, subtree: true };

    function unsetTaggedForRemove(formControls: FormControl[]) {
      for (const control of formControls) {
        if (control.dataset.felteUnsetOnRemove !== 'true') continue;
        data.update(($data) => {
          _unset($data, getPath(control));
          return $data;
        });
      }
    }

    function mutationCallback(mutationList: MutationRecord[]) {
      for (const mutation of mutationList) {
        if (mutation.type !== 'childList') continue;
        if (mutation.addedNodes.length > 0) {
          const shouldUpdate = Array.from(mutation.addedNodes).some((node) => {
            if (!isElement(node)) return false;
            if (isFormControl(node)) return true;
            const formControls = getFormControls(node);
            return formControls.length > 0;
          });
          if (!shouldUpdate) continue;
          currentExtenders.forEach((extender) => extender?.destroy?.());
          currentExtenders = extender.map(callExtender);
          const { defaultData: newDefaultData } = getFormDefaultValues<Data>(
            node
          );
          data.update(($data) => _defaultsDeep($data, newDefaultData));
        }
        if (mutation.removedNodes.length > 0) {
          for (const removedNode of mutation.removedNodes) {
            if (!isElement(removedNode)) continue;
            const formControls = getFormControls(removedNode);
            if (formControls.length === 0) continue;
            currentExtenders.forEach((extender) => extender?.destroy?.());
            currentExtenders = extender.map(callExtender);
            unsetTaggedForRemove(formControls);
          }
        }
      }
    }

    const observer = new MutationObserver(mutationCallback);

    observer.observe(node, mutationOptions);
    node.addEventListener('input', handleInput);
    node.addEventListener('change', handleChange);
    node.addEventListener('focusout', handleBlur);
    node.addEventListener('submit', handleSubmit);
    const unsubscribeErrors = errors.subscribe(($errors) => {
      for (const el of node.elements) {
        if (!isFormControl(el) || !el.name) continue;
        const fieldErrors = _get($errors, getPath(el));
        const message = Array.isArray(fieldErrors)
          ? fieldErrors.join('\n')
          : typeof fieldErrors === 'string'
          ? fieldErrors
          : undefined;
        if (message === el.dataset.felteValidationMessage) continue;
        if (message) el.dataset.felteValidationMessage = message;
        else delete el.dataset.felteValidationMessage;
      }
    });

    return {
      destroy() {
        observer.disconnect();
        node.removeEventListener('input', handleInput);
        node.removeEventListener('change', handleChange);
        node.removeEventListener('focusout', handleBlur);
        node.removeEventListener('submit', handleSubmit);
        unsubscribeErrors();
        currentExtenders.forEach((extender) => extender?.destroy?.());
      },
    };
  }

  return {
    form,
    data: { ...data, set: newDataSet },
    errors,
    touched,
    handleSubmit,
    createSubmitHandler,
    reset,
    isValid,
    isSubmitting,
    setTouched,
    setError,
    setField,
    validate,
  };
}
