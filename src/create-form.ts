import produce from 'immer';
import _defaultsDeep from 'lodash/defaultsDeep';
import _get from 'lodash/get';
import _isPlainObject from 'lodash/isPlainObject';
import _mergeWith from 'lodash/mergeWith';
import _set from 'lodash/set';
import _unset from 'lodash/unset';
import { get } from 'svelte/store';
import {
  deepSet,
  deepSome,
  getFormControls,
  getFormDefaultValues,
  getPath,
  isElement,
  isFormControl,
  isInputElement,
} from './helpers';
import { createStores } from './stores';
import type {
  FieldValue,
  Form,
  FormConfig,
  FormConfigWithInitialValues,
  FormConfigWithoutInitialValues,
  FormControl,
  Touched,
} from './types';

/**
 * Creates the stores and `form` action to make the form reactive.
 * In order to use auto-subscriptions with the stores, call this function at the top-level scope of the component.
 *
 * @param config - Configuration for the form itself. Since `initialValues` is set, `Data` will not be undefined
 */
export function createForm<Data extends Record<string, unknown>>(
  config: FormConfigWithInitialValues<Data>
): Form<Data>;
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
  config.useConstraintApi ??= false;
  const { isSubmitting, data, errors, touched, isValid } = createStores<Data>(
    config
  );
  async function handleSubmit(event: Event) {
    event.preventDefault();
    try {
      isSubmitting.set(true);
      const currentData = get(data);
      touched.update((t) => {
        return deepSet<Touched<Data>, boolean>(t, true) as Touched<Data>;
      });
      if (config.validate) {
        const currentErrors = await config.validate(currentData);
        const hasErrors = deepSome(currentErrors, (error) => !!error);
        if (hasErrors) {
          config.useConstraintApi &&
            (event.target as HTMLFormElement).reportValidity();
          return;
        }
      }
      await config.onSubmit(currentData);
    } catch (e) {
      if (!config.onError) throw e;
      config.onError(e);
    } finally {
      isSubmitting.set(false);
    }
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
        {},
        values,
        config.initialValues,
        dataSetCustomizer
      );
      return _mergeWith({}, changed, current, dataSetTouchedCustomizer);
    });
    return data.set(values);
  }

  function setTouched(fieldName: string): void {
    touched.update(
      produce((t) => {
        _set(t, fieldName, true);
      })
    );
  }

  function setError(path: string, error: string | string[]): void {
    errors.update(
      produce(($errors) => {
        _set($errors, path, error);
      })
    );
  }

  function setField(path: string, value?: FieldValue, touch = true) {
    data.update(produce(($data) => _set($data, path, value)));
    if (touch) setTouched(path);
  }

  function form(node: HTMLFormElement) {
    node.noValidate = !!config.validate;
    const { defaultData, defaultTouched } = getFormDefaultValues<Data>(node);
    touched.set(defaultTouched);
    data.set(defaultData);

    function setCheckboxValues(target: HTMLInputElement) {
      const checkboxes = node.querySelectorAll(`[name="${target.name}"]`);
      if (checkboxes.length === 1)
        return data.update(
          produce(($data) => _set($data, getPath(target), target.checked))
        );
      return data.update(
        produce(($data) =>
          _set(
            $data,
            getPath(target),
            Array.from(checkboxes)
              .filter((el: HTMLInputElement) => el.checked)
              .map((el: HTMLInputElement) => el.value)
          )
        )
      );
    }

    function setRadioValues(target: HTMLInputElement) {
      const radios = node.querySelectorAll(`[name="${target.name}"]`);
      const checkedRadio = Array.from(radios).find(
        (el) => isInputElement(el) && el.checked
      ) as HTMLInputElement | undefined;
      data.update(
        produce((data) => _set(data, getPath(target), checkedRadio?.value))
      );
    }

    function setFileValue(target: HTMLInputElement) {
      const files = target.files;
      data.update(
        produce((data) =>
          _set(data, getPath(target), target.multiple ? files : files[0])
        )
      );
    }

    function handleInput(e: InputEvent) {
      const target = e.target;
      if (!isFormControl(target)) return;
      if (['checkbox', 'radio', 'file'].includes(target.type)) return;
      if (!target.name) return;
      setTouched(getPath(target));
      data.update(
        produce((data) =>
          _set(
            data,
            getPath(target),
            target.type.match(/^(number|range)$/) ? +target.value : target.value
          )
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
        if (control.dataset.unsetOnRemove !== 'true') continue;
        data.update(
          produce(($data) => {
            _unset($data, getPath(control));
          })
        );
      }
    }

    function mutationCallback(mutationList: MutationRecord[]) {
      for (const mutation of mutationList) {
        if (mutation.type !== 'childList') continue;
        if (mutation.addedNodes.length > 0) {
          const { defaultData: newDefaultData } = getFormDefaultValues<Data>(
            node
          );
          data.update(produce(($data) => _defaultsDeep($data, newDefaultData)));
        }
        if (mutation.removedNodes.length > 0) {
          for (const removedNode of mutation.removedNodes) {
            if (!isElement(removedNode)) continue;
            const formControls = getFormControls(removedNode);
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
    const unsubscribeErrors = config.useConstraintApi
      ? errors.subscribe(($errors) => {
          for (const el of node.elements) {
            if (!isFormControl(el) || !el.name) continue;
            const fieldErrors = _get($errors, getPath(el), '');
            const message = Array.isArray(fieldErrors)
              ? fieldErrors.join('\n')
              : typeof fieldErrors === 'string'
              ? fieldErrors
              : '';
            el.setCustomValidity(message || '');
          }
        })
      : undefined;

    return {
      destroy() {
        observer.disconnect();
        node.removeEventListener('input', handleInput);
        node.removeEventListener('change', handleChange);
        node.removeEventListener('focusout', handleBlur);
        node.removeEventListener('submit', handleSubmit);
        unsubscribeErrors?.();
      },
    };
  }

  return {
    form,
    data: { ...data, set: newDataSet },
    errors,
    touched,
    handleSubmit,
    isValid,
    isSubmitting,
    setTouched,
    setError,
    setField,
  };
}
