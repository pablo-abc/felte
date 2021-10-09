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
  TransformFunction,
} from '@felte/common';
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
  isTextAreaElement,
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
  addTransformer(transformer: TransformFunction<Data>): void;
};

export function createHelpers<Data extends Obj>({
  stores,
  config,
  currentExtenders,
  extender,
  addValidator,
  addTransformer,
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
        await onSubmit(currentData, {
          form: formNode,
          controls:
            formNode && Array.from(formNode.elements).filter(isFormControl),
          config: { ...config, ...altConfig },
        });
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
    if (!node.requestSubmit) node.requestSubmit = handleSubmit;
    function callExtender(extender: Extender<Data>) {
      return extender({
        form: node,
        controls: Array.from(node.elements).filter(isFormControl),
        data,
        errors,
        touched,
        config,
        addValidator,
        addTransformer,
      });
    }

    function proxyInputs() {
      for (const control of Array.from(node.elements).filter(isFormControl)) {
        if (shouldIgnore(control)) continue;
        let propName = 'value';
        if (
          isInputElement(control) &&
          ['checkbox', 'radio'].includes(control.type)
        ) {
          propName = 'checked';
        }
        if (isInputElement(control) && control.type === 'file') {
          propName = 'files';
        }
        const prop = Object.getOwnPropertyDescriptor(
          isSelectElement(control)
            ? HTMLSelectElement.prototype
            : isTextAreaElement(control)
            ? HTMLTextAreaElement.prototype
            : HTMLInputElement.prototype,
          propName
        );
        Object.defineProperty(control, propName, {
          configurable: true,
          set(newValue) {
            prop?.set?.call(control, newValue);

            if (isInputElement(control)) {
              if (control.type === 'checkbox')
                return setCheckboxValues(control);
              if (control.type === 'radio') return setRadioValues(control);
              if (control.type === 'file') return setFileValue(control);
            }
            const inputValue = isSelectElement(control)
              ? control.value
              : getInputTextOrNumber(control);
            data.update(($data) => {
              return _set($data, getPath(control), inputValue);
            });
          },
          get: prop?.get,
        });
      }
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

    function handleInput(e: Event) {
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
      if (config.touchTriggerEvents?.input) setTouched(getPath(target));
      const inputValue = getInputTextOrNumber(target);
      data.update(($data) => {
        return _set($data, getPath(target), inputValue);
      });
    }

    function handleChange(e: Event) {
      const target = e.target;
      if (!target || !isFormControl(target) || shouldIgnore(target)) return;
      if (!target.name) return;
      if (config.touchTriggerEvents?.change) setTouched(getPath(target));
      if (isSelectElement(target)) {
        data.update(($data) => {
          return _set($data, getPath(target), target.value);
        });
      }
      if (!isInputElement(target)) return;
      if (target.type === 'checkbox') setCheckboxValues(target);
      if (target.type === 'radio') setRadioValues(target);
      if (target.type === 'file') setFileValue(target);
    }

    function handleBlur(e: Event) {
      const target = e.target;
      if (!target || !isFormControl(target) || shouldIgnore(target)) return;
      if (!target.name) return;
      if (config.touchTriggerEvents?.blur) setTouched(getPath(target));
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
          proxyInputs();
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
    proxyInputs();
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
