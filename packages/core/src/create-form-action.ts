import type {
  Extender,
  Obj,
  Stores,
  FormConfig,
  ValidationFunction,
  TransformFunction,
  ExtenderHandler,
  FormControl,
  CreateSubmitHandlerConfig,
  Touched,
  Errors,
} from '@felte/common';
import {
  isFormControl,
  shouldIgnore,
  isInputElement,
  isSelectElement,
  isTextAreaElement,
  getInputTextOrNumber,
  _get,
  _set,
  _unset,
  _merge,
  _cloneDeep,
  _defaultsDeep,
  getPath,
  getIndex,
  deepSet,
  deepSome,
  getPathFromDataset,
  getFormDefaultValues,
  isElement,
  getFormControls,
  executeValidation,
} from '@felte/common';
import { get } from 'svelte/store';

type Configuration<Data extends Obj> = {
  stores: Stores<Data>;
  config: FormConfig<Data>;
  extender: Extender<Data>[];
  helpers: {
    reset(): void;
    validate(): Promise<Errors<Data> | void>;
    addValidator(validator: ValidationFunction<Data>): void;
    addTransformer(transformer: TransformFunction<Data>): void;
    setFields(values: Data): void;
    setTouched(fieldName: string, index?: number): void;
  };
  _setFormNode(node: HTMLFormElement): void;
  _getFormNode(): HTMLFormElement | undefined;
  _setInitialValues(values: Data): void;
  _getInitialValues(): Data;
  _setCurrentExtenders(extenders: ExtenderHandler<Data>[]): void;
  _getCurrentExtenders(): ExtenderHandler<Data>[];
};

export function createFormAction<Data extends Obj>({
  helpers,
  stores,
  config,
  extender,
  _setFormNode,
  _getFormNode,
  _setInitialValues,
  _getInitialValues,
  _setCurrentExtenders,
  _getCurrentExtenders,
}: Configuration<Data>) {
  const {
    setFields,
    setTouched,
    reset,
    validate,
    addValidator,
    addTransformer,
  } = helpers;
  const { data, errors, touched, isSubmitting } = stores;

  function createSubmitHandler(altConfig?: CreateSubmitHandlerConfig<Data>) {
    const onSubmit = altConfig?.onSubmit ?? config.onSubmit;
    const validate = altConfig?.validate ?? config.validate;
    const onError = altConfig?.onError ?? config.onError;
    return async function handleSubmit(event?: Event) {
      const formNode = _getFormNode();
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
          _getCurrentExtenders().forEach((extender) =>
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
          _getCurrentExtenders().forEach((extender) =>
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
        setFields,
        validate,
        reset,
      });
    }

    function proxyInputs() {
      for (const control of Array.from(node.elements).filter(isFormControl)) {
        if (shouldIgnore(control) || !control.name) continue;
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

    _setCurrentExtenders(extender.map(callExtender));
    node.noValidate = !!config.validate;
    const { defaultData } = getFormDefaultValues<Data>(node);
    _setFormNode(node);
    _setInitialValues(_merge(_cloneDeep(defaultData), _getInitialValues()));
    setFields(_getInitialValues());
    touched.set(deepSet(_getInitialValues(), false));

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
      if (checkboxes.length === 0) return;
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
          _getCurrentExtenders().forEach((extender) => extender?.destroy?.());
          _setCurrentExtenders(extender.map(callExtender));
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
            _getCurrentExtenders().forEach((extender) => extender?.destroy?.());
            _setCurrentExtenders(extender.map(callExtender));
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
        _getCurrentExtenders().forEach((extender) => extender?.destroy?.());
      },
    };
  }

  return {
    form,
    createSubmitHandler,
    handleSubmit,
  };
}
