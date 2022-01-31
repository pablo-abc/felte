import type {
  Extender,
  Obj,
  Stores,
  FormConfig,
  TransformFunction,
  ExtenderHandler,
  FormControl,
  CreateSubmitHandlerConfig,
  Errors,
  AddValidatorFn,
  Helpers,
  ValidationFunction,
  Keyed,
} from '@felte/common';
import {
  isFormControl,
  shouldIgnore,
  isInputElement,
  isSelectElement,
  isElement,
  getInputTextOrNumber,
  _get,
  _set,
  _unset,
  _merge,
  _cloneDeep,
  _defaultsDeep,
  getPath,
  deepSet,
  deepSome,
  getFormDefaultValues,
  getFormControls,
  _isPlainObject,
} from '@felte/common';
import type { FelteSuccessDetail, FelteErrorDetail } from './events';
import type { SuccessResponse, FetchResponse } from './error';
import { get } from './get';
import { FelteSubmitError } from './error';
import { deepSetTouched } from './deep-set-touched';
import { deepRemoveKey } from './deep-set-key';

function createDefaultSubmitHandler(form?: HTMLFormElement) {
  if (!form) return;
  return async function onSubmit(): Promise<SuccessResponse> {
    let body: FormData | URLSearchParams = new FormData(form);
    const action = new URL(form.action);
    const method =
      form.method.toLowerCase() === 'get'
        ? 'get'
        : action.searchParams.get('_method') || form.method;
    let enctype = form.enctype;

    if (form.querySelector('input[type="file"]')) {
      enctype = 'multipart/form-data';
    }
    if (method === 'get' || enctype === 'application/x-www-form-urlencoded') {
      body = new URLSearchParams(body as any);
    }

    let fetchOptions: RequestInit;

    if (method === 'get') {
      (body as URLSearchParams).forEach((value, key) => {
        action.searchParams.append(key, value);
      });
      fetchOptions = { method };
    } else {
      fetchOptions = {
        method,
        body,
        headers: {
          'Content-Type': enctype,
        },
      };
    }

    const response: FetchResponse = await fetch(
      action.toString(),
      fetchOptions
    );

    if (response.ok) return response;
    throw new FelteSubmitError(
      'An error occurred while submitting the form',
      response
    );
  };
}

export type FormActionConfig<Data extends Obj> = {
  stores: Stores<Data>;
  config: FormConfig<Data>;
  extender: Extender<Data>[];
  validateErrors(
    data: Data | Keyed<Data>,
    altValidate?: ValidationFunction<Data> | ValidationFunction<Data>[]
  ): Promise<Errors<Data> | undefined>;
  validateWarnings(
    data: Data | Keyed<Data>,
    altWarn?: ValidationFunction<Data> | ValidationFunction<Data>[]
  ): Promise<Errors<Data> | undefined>;
  helpers: Helpers<Data, string> & {
    addValidator: AddValidatorFn<Data>;
    addTransformer(transformer: TransformFunction<Data>): void;
  };
  _setFormNode(node: HTMLFormElement): void;
  _getFormNode(): HTMLFormElement | undefined;
  _getInitialValues(): Data;
  _setCurrentExtenders(extenders: ExtenderHandler<Data>[]): void;
  _getCurrentExtenders(): ExtenderHandler<Data>[];
};

export function createFormAction<Data extends Obj>({
  helpers,
  stores,
  config,
  extender,
  validateErrors,
  validateWarnings,
  _setFormNode,
  _getFormNode,
  _getInitialValues,
  _setCurrentExtenders,
  _getCurrentExtenders,
}: FormActionConfig<Data>) {
  const { setFields, setTouched, reset, setInitialValues } = helpers;
  const {
    addValidator,
    addTransformer,
    validate,
    setIsDirty,
    setIsSubmitting,
    ...contextHelpers
  } = helpers;
  const {
    data,
    errors,
    warnings,
    touched,
    isSubmitting,
    isDirty,
    interacted,
  } = stores;

  function createSubmitHandler(altConfig?: CreateSubmitHandlerConfig<Data>) {
    const onError = altConfig?.onError ?? config.onError;
    const onSuccess = altConfig?.onSuccess ?? config.onSuccess;
    return async function handleSubmit(event?: Event) {
      const formNode = _getFormNode();
      const onSubmit =
        altConfig?.onSubmit ??
        config.onSubmit ??
        createDefaultSubmitHandler(formNode);
      if (!onSubmit) return;
      event?.preventDefault();
      isSubmitting.set(true);
      interacted.set(null);
      const currentData = deepRemoveKey(get(data));
      const currentErrors = await validateErrors(
        currentData,
        altConfig?.validate
      );
      const currentWarnings = await validateWarnings(
        currentData,
        altConfig?.warn
      );
      if (currentWarnings)
        warnings.set(_merge(deepSet(currentData, []), currentWarnings));
      touched.set(deepSetTouched(currentData, true));
      if (currentErrors) {
        const hasErrors = deepSome(currentErrors, (error) =>
          Array.isArray(error) ? error.length >= 1 : !!error
        );
        if (hasErrors) {
          await new Promise((r) => setTimeout(r));
          _getCurrentExtenders().forEach((extender) =>
            extender.onSubmitError?.({
              data: currentData,
              errors: currentErrors,
            })
          );
          isSubmitting.set(false);
          return;
        }
      }
      const context = {
        ...contextHelpers,
        form: formNode,
        controls:
          formNode && Array.from(formNode.elements).filter(isFormControl),
        config: { ...config, ...altConfig },
      };
      try {
        const response = await onSubmit(currentData, context);
        formNode?.dispatchEvent(
          new CustomEvent<FelteSuccessDetail<Data>>('feltesuccess', {
            detail: {
              response,
              ...context,
            },
          })
        );
        await onSuccess?.(response, context);
      } catch (e) {
        formNode?.dispatchEvent(
          new CustomEvent<FelteErrorDetail<Data>>('felteerror', {
            detail: {
              error: e,
              ...context,
            },
          })
        );
        if (!onError) return;
        const serverErrors = await onError(e, context);
        if (serverErrors) {
          errors.set(serverErrors);
          await new Promise((r) => setTimeout(r));
          _getCurrentExtenders().forEach((extender) =>
            extender.onSubmitError?.({
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
    if (!node.requestSubmit)
      node.requestSubmit = handleSubmit as typeof node.requestSubmit;
    function callExtender(stage: 'MOUNT' | 'UPDATE') {
      return function (extender: Extender<Data>) {
        return extender({
          form: node,
          stage,
          controls: Array.from(node.elements).filter(isFormControl),
          data,
          errors,
          warnings,
          touched,
          config,
          addValidator,
          addTransformer,
          setFields,
          validate,
          reset,
        });
      };
    }

    _setCurrentExtenders(extender.map(callExtender('MOUNT')));
    node.noValidate = !!config.validate;
    const { defaultData, defaultTouched } = getFormDefaultValues<Data>(node);
    _setFormNode(node);
    setInitialValues(_merge(_cloneDeep(defaultData), _getInitialValues()));
    setFields(_getInitialValues());
    touched.set(defaultTouched);

    function setCheckboxValues(target: HTMLInputElement) {
      const elPath = getPath(target);
      const checkboxes = Array.from(
        node.querySelectorAll(`[name="${target.name}"]`)
      ).filter((checkbox) => {
        if (!isFormControl(checkbox)) return false;
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
      const files = Array.from(target.files ?? []);
      data.update(($data) => {
        return _set($data, getPath(target), target.multiple ? files : files[0]);
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
      isDirty.set(true);
      const inputValue = getInputTextOrNumber(target);
      interacted.set(target.name);
      data.update(($data) => {
        return _set($data, getPath(target), inputValue);
      });
    }

    function handleChange(e: Event) {
      const target = e.target;
      if (!target || !isFormControl(target) || shouldIgnore(target)) return;
      if (!target.name) return;
      setTouched<string, any>(getPath(target), true);
      interacted.set(target.name);
      if (
        isSelectElement(target) ||
        ['checkbox', 'radio', 'file', 'hidden'].includes(target.type)
      ) {
        isDirty.set(true);
      }
      if (isSelectElement(target) || target.type === 'hidden') {
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
      setTouched<string, any>(getPath(target), true);
      interacted.set(target.name);
    }

    function handleReset(e: Event) {
      e.preventDefault();
      reset();
    }

    const mutationOptions = { childList: true, subtree: true };

    function unsetTaggedForRemove(formControls: FormControl[]) {
      for (const control of formControls.reverse()) {
        if (
          control.hasAttribute('data-felte-keep-on-remove') &&
          control.dataset.felteKeepOnRemove !== 'false'
        )
          continue;
        const fieldArrayReg = /.*(\[[0-9]+\]|\.[0-9]+)\.[^.]+$/;
        let fieldName = getPath(control);
        const shape = get(touched);
        const isFieldArray = fieldArrayReg.test(fieldName);
        if (isFieldArray) {
          const arrayPath = fieldName.split('.').slice(0, -1).join('.');
          const valueToRemove = _get(shape, arrayPath);
          if (
            _isPlainObject(valueToRemove) &&
            Object.keys(valueToRemove).length <= 1
          ) {
            fieldName = arrayPath;
          }
        }
        data.update(($data) => {
          return _unset($data, fieldName);
        });
        touched.update(($touched) => {
          return _unset($touched, fieldName);
        });
        errors.update(($errors) => {
          return _unset($errors, fieldName);
        });
        warnings.update(($warnings) => {
          return _unset($warnings, fieldName);
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
          _getCurrentExtenders().forEach((extender) => extender.destroy?.());
          _setCurrentExtenders(extender.map(callExtender('UPDATE')));
          const {
            defaultData: newDefaultData,
            defaultTouched: newDefaultTouched,
          } = getFormDefaultValues<Data>(node);
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
            _getCurrentExtenders().forEach((extender) => extender.destroy?.());
            _setCurrentExtenders(extender.map(callExtender('UPDATE')));
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
    node.addEventListener('reset', handleReset);
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
        if (message) {
          el.dataset.felteValidationMessage = message;
          el.setAttribute('aria-invalid', 'true');
        } else {
          delete el.dataset.felteValidationMessage;
          el.removeAttribute('aria-invalid');
        }
      }
    });

    return {
      destroy() {
        observer.disconnect();
        node.removeEventListener('input', handleInput);
        node.removeEventListener('change', handleChange);
        node.removeEventListener('focusout', handleBlur);
        node.removeEventListener('submit', handleSubmit);
        node.removeEventListener('reset', handleReset);
        unsubscribeErrors();
        _getCurrentExtenders().forEach((extender) => extender.destroy?.());
      },
    };
  }

  return {
    form,
    createSubmitHandler,
    handleSubmit,
  };
}
