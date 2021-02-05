import { get } from 'svelte/store';
import { createStores } from './stores';
import _set from 'lodash/set';
import _get from 'lodash/get';
import _update from 'lodash/update';
import _mergeWith from 'lodash/mergeWith';
import _defaultsDeep from 'lodash/defaultsDeep';
import _isPlainObject from 'lodash/isPlainObject';
import produce from 'immer';
import type {
  Form,
  FormConfig,
  FormConfigWithInitialValues,
  FormConfigWithoutInitialValues,
  Touched,
} from './types';
import { deepSet, deepSome } from './helpers';

type FormControls = HTMLInputElement | HTMLTextAreaElement;

function isInputElement(el: EventTarget): el is HTMLInputElement {
  return (el as HTMLInputElement)?.nodeName === 'INPUT';
}

function isTextAreaElement(el: EventTarget): el is HTMLTextAreaElement {
  return (el as HTMLTextAreaElement)?.nodeName === 'TEXTAREA';
}

function isFieldSetElement(el: EventTarget): el is HTMLFieldSetElement {
  return (el as HTMLFieldSetElement)?.nodeName === 'FIELDSET';
}

function getPath(el: FormControls): string {
  const fieldSetName = el.dataset.fieldset;
  return fieldSetName ? `${fieldSetName}.${el.name}` : el.name;
}

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
    try {
      isSubmitting.set(true);
      event.preventDefault();
      touched.update((t) => {
        return deepSet<Touched<Data>, boolean>(t, true) as Touched<Data>;
      });
      const currentErrors = get(errors);
      const hasErrors = deepSome(currentErrors, (error) => !!error);
      if (hasErrors) {
        config.useConstraintApi &&
          (event.target as HTMLFormElement).reportValidity();
        return;
      }
      await config.onSubmit(get(data));
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

  function getFormFieldsDefaultValues(node: HTMLFormElement) {
    const defaultData: Record<string, unknown> = {};
    let fieldSetElements: Set<Element> = new Set();
    let fieldSet: HTMLFieldSetElement | undefined;
    for (const el of node.elements) {
      if (isFieldSetElement(el)) {
        fieldSet = el;
        fieldSetElements = new Set(Array.from(el.elements));
      }
      if ((!isInputElement(el) && !isTextAreaElement(el)) || !el.name) continue;
      let elName = el.name;
      if (fieldSetElements.size && fieldSetElements.has(el)) {
        if (fieldSet?.name) {
          elName = `${fieldSet.name}.${elName}`;
          el.dataset.fieldset = fieldSet.name;
        }
        fieldSetElements.delete(el);
      } else {
        fieldSet = undefined;
      }
      touched.update(produce((t) => _set(t, elName, false)));
      if (isInputElement(el) && el.type === 'checkbox') {
        if (typeof _get(defaultData, elName) === 'undefined') {
          const checkboxes = node.querySelectorAll(`[name="${elName}"]`);
          if (checkboxes.length === 1) {
            _set(defaultData, elName, el.checked);
            continue;
          }
          _set(defaultData, elName, el.checked ? [el.value] : []);
          continue;
        }
        if (Array.isArray(defaultData[elName]) && el.checked) {
          _update(defaultData, elName, (value) => [...value, el.value]);
        }
        continue;
      }
      if (isInputElement(el) && el.type === 'radio' && el.checked) {
        _set(defaultData, elName, el.value);
        continue;
      }
      if (isInputElement(el) && el.type === 'file') {
        _set(defaultData, elName, el.multiple ? el.files : el.files[0]);
        continue;
      }
      _set(
        defaultData,
        elName,
        el.type.match(/^(number|range)$/) ? +el.value : el.value
      );
    }
    return defaultData as Data;
  }

  function form(node: HTMLFormElement) {
    node.noValidate = !!config.validate;
    data.set(getFormFieldsDefaultValues(node));

    function touchField(fieldName: string) {
      touched.update(
        produce((t) => {
          _set(t, fieldName, true);
        })
      );
    }

    function setCheckboxValues(target: HTMLInputElement) {
      const checkboxes = node.querySelectorAll(`[name="${target.name}"]`);
      if (checkboxes.length === 1)
        return data.update(
          produce((data) => _set(data, getPath(target), target.checked))
        );
      return data.update(
        produce((data) =>
          _set(
            data,
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
      if (!isInputElement(target) && !isTextAreaElement(target)) return;
      if (['checkbox', 'radio', 'file'].includes(target.type)) return;
      if (!target.name) return;
      touchField(getPath(target));
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
      touchField(getPath(target));
      if (target.type === 'checkbox') setCheckboxValues(target);
      if (target.type === 'radio') setRadioValues(target);
      if (target.type === 'file') setFileValue(target);
    }

    function handleBlur(e: Event) {
      const target = e.target;
      if (!isInputElement(target) && !isTextAreaElement(target)) return;
      if (!target.name) return;
      touchField(getPath(target));
    }

    const mutationOptions = { childList: true, subtree: true };

    function mutationCallback(mutationList: MutationRecord[]) {
      for (const mutation of mutationList) {
        if (mutation.type !== 'childList') continue;
        if (mutation.addedNodes.length === 0) continue;
        const newDefaultData = getFormFieldsDefaultValues(node);
        data.update(produce(($data) => _defaultsDeep($data, newDefaultData)));
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
            if ((!isInputElement(el) && !isTextAreaElement(el)) || !el.name)
              continue;
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
        node.removeEventListener('foucsout', handleBlur);
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
  };
}
