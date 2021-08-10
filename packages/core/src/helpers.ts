import type {
  CreateSubmitHandlerConfig,
  Errors,
  Extender,
  ExtenderHandler,
  FieldValue,
  FormConfig,
  FormControl,
  Obj,
  Stores,
  Touched,
  ValidationFunction,
} from '@felte/common';
import type { DispatchEvent } from './custom-events';
import {
  deepSet,
  deepSome,
  executeValidation,
  getFormControls,
  getFormDefaultValues,
  getInputTextOrNumber,
  getPath,
  isElement,
  isFormControl,
  isInputElement,
  setControlValue,
  setForm,
  _cloneDeep,
  _defaultsDeep,
  _get,
  _merge,
  _set,
  _unset,
  getIndex,
  isSelectElement,
  getPathFromDataset,
  shouldIgnore,
} from '@felte/common';
import { get } from 'svelte/store';

type CreateHelpersOptions<Data extends Obj> = {
  config: FormConfig<Data>;
  stores: Stores<Data>;
  currentExtenders: ExtenderHandler<Data>[];
  extender: Extender<Data>[];
  addValidator(validator: ValidationFunction<Data>): void;
};

function isDispatchEvent(event: DispatchEvent | Event): event is DispatchEvent {
  const detail = (event as DispatchEvent).detail;
  return !!detail && !!detail.path;
}

export function createHelpers<Data extends Obj>({
  stores,
  config,
  currentExtenders,
  extender,
  addValidator,
}: CreateHelpersOptions<Data>) {
  const { isSubmitting, data, touched, errors } = stores;

  function createSubmitHandler(altConfig?: CreateSubmitHandlerConfig<Data>) {
    const onSubmit = altConfig?.onSubmit ?? config.onSubmit;
    const validate = altConfig?.validate ?? config.validate;
    const onError = altConfig?.onError ?? config.onError;
    return async function handleSubmit(event?: Event) {
      event?.preventDefault();
      isSubmitting.set(true);
      const currentData = get(data);
      const currentErrors = await executeValidation(currentData, validate);
      touched.update((t) => {
        return deepSet<Touched<Data>, boolean>(t, true) as Touched<Data>;
      });
      if (currentErrors) {
        errors.set(currentErrors);
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

  function setTouched(fieldName: string, index?: number): void {
    const path =
      typeof index === 'undefined' ? fieldName : `${fieldName}[${index}]`;
    touched.update(($touched) => _set($touched, path, true));
  }

  function setError(path: string, error: string | string[]): void {
    errors.update(($errors) => _set($errors, path, error));
  }

  function setField(path: string, value?: FieldValue, touch = true): void {
    data.update(($data) => _set($data, path, value));
    if (touch) setTouched(path);
    if (!formNode) return;
    for (const control of formNode.elements) {
      if (!isFormControl(control) || !control.name) continue;
      const elName = getPath(control);
      if (path !== elName) continue;
      setControlValue(control, value);
      return;
    }
  }

  function setFields(values: Data): void {
    data.set(_cloneDeep(values));
    if (formNode) setForm(formNode, values);
  }

  async function validate(): Promise<Errors<Data> | void> {
    const currentData = get(data);
    touched.update((t) => {
      return deepSet<Touched<Data>, boolean>(t, true) as Touched<Data>;
    });
    const currentErrors = await executeValidation(currentData, config.validate);
    errors.set(currentErrors || {});
    return currentErrors;
  }

  let formNode: HTMLFormElement | undefined;
  let initialValues = config.initialValues ?? ({} as Data);

  function reset(): void {
    setFields(_cloneDeep(initialValues));
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
        addValidator,
      });
    }
    currentExtenders = extender.map(callExtender);
    node.noValidate = !!config.validate;
    const { defaultData } = getFormDefaultValues<Data>(node);
    formNode = node;
    initialValues = _merge(_cloneDeep(defaultData), initialValues);
    setFields(initialValues);
    touched.set(deepSet(initialValues, false));

    function setCheckboxValues(target: HTMLInputElement) {
      const index = getIndex(target);
      const elPath = getPath(target);
      const checkboxes = Array.from(
        node.querySelectorAll(`[name="${target.name}"]`)
      ).filter((checkbox) => {
        if (!isFormControl(checkbox)) return false;
        if (typeof index !== 'undefined') {
          const felteIndex = Number(
            (checkbox as HTMLInputElement).dataset.felteIndex
          );
          return felteIndex === index;
        }
        return elPath === getPath(checkbox);
      });
      if (checkboxes.length === 1) {
        return data.update(($data) =>
          _set($data, getPath(target), target.checked)
        );
      }
      return data.update(($data) => {
        return _set(
          $data,
          getPath(target),
          checkboxes
            .filter(isInputElement)
            .filter((el: HTMLInputElement) => el.checked)
            .map((el: HTMLInputElement) => el.value)
        );
      });
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
      data.update(($data) => {
        return _set(
          $data,
          getPath(target),
          target.multiple ? Array.from(files ?? []) : files?.[0]
        );
      });
    }

    function handleLoadField(e: DispatchEvent | Event) {
      if (!isDispatchEvent(e)) return;
      touched.update(($touched) => {
        return _set($touched, e.detail.path, false);
      });
      data.update(($data) => {
        return _set($data, e.detail.path, e.detail.value);
      });
    }

    function handleInput(e: DispatchEvent | Event) {
      let path: string;
      let inputValue: FieldValue;
      if (!isDispatchEvent(e)) {
        const target = e.target;
        if (
          !target ||
          !isFormControl(target) ||
          isSelectElement(target) ||
          shouldIgnore(target)
        )
          return;
        if (['checkbox', 'radio', 'file'].includes(target.type)) return;
        if (!target.name) return;
        inputValue = getInputTextOrNumber(target);
        path = getPath(target);
      } else {
        inputValue = e.detail.value;
        path = e.detail.path;
      }
      if (config.touchTriggerEvents?.input) setTouched(path);
      data.update(($data) => {
        return _set($data, path, inputValue);
      });
    }

    function handleChange(e: DispatchEvent | Event) {
      let path: string;
      if (!isDispatchEvent(e)) {
        const target = e.target;
        if (!target || !isFormControl(target) || shouldIgnore(target)) return;
        if (!target.name) return;
        path = getPath(target);
        if (isSelectElement(target)) {
          data.update(($data) => {
            return _set($data, path, target.value);
          });
        }
        if (!isInputElement(target)) return;
        if (target.type === 'checkbox') setCheckboxValues(target);
        if (target.type === 'radio') setRadioValues(target);
        if (target.type === 'file') setFileValue(target);
      } else {
        path = e.detail.path;
        data.update(($data) => {
          return _set($data, path, e.detail.value);
        });
      }
      if (config.touchTriggerEvents?.change) setTouched(path);
    }

    function handleBlur(e: Event | DispatchEvent) {
      let path: string;
      if (!isDispatchEvent(e)) {
        const target = e.target;
        if (!target || !isFormControl(target) || shouldIgnore(target)) return;
        if (!target.name) return;
        path = getPath(target);
      } else {
        path = e.detail.path;
      }
      if (config.touchTriggerEvents?.blur) setTouched(path);
    }

    const mutationOptions = { childList: true, subtree: true };

    function unsetTaggedForRemove(formControls: FormControl[]) {
      for (const control of formControls) {
        if (control.dataset.felteUnsetOnRemove !== 'true') continue;
        data.update(($data) => {
          return _unset($data, getPathFromDataset(control));
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
          const newDefaultTouched = deepSet(newDefaultData, false);
          data.update(($data) => _defaultsDeep<Data>($data, newDefaultData));
          touched.update(($touched) => {
            return _defaultsDeep($touched, newDefaultTouched);
          });
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
    node.addEventListener('felteLoadField', handleLoadField);
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
        node.removeEventListener('felteLoadField', handleLoadField);
        unsubscribeErrors();
        currentExtenders.forEach((extender) => extender?.destroy?.());
      },
    };
  }
  return {
    handleSubmit,
    createSubmitHandler,
    reset,
    setTouched,
    setError,
    setField,
    setFields,
    validate,
    form,
  };
}
