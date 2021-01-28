import { writable, derived, get } from 'svelte/store';
import type { Readable, Writable } from 'svelte/store';

type FormConfigWithInitialValues<D extends Record<string, unknown>> = {
  initialValues: D;
  validate?: (values: D) => Errors<D>;
  onSubmit: (values: D) => Promise<void> | void;
};

type FormConfigWithoutInitialValues<D extends Record<string, unknown>> = {
  validate?: (values: D) => Errors<D>;
  onSubmit: (values: D) => Promise<void> | void;
};

export type FormConfig<D extends Record<string, unknown>> = {
  initialValues?: D;
  validate?: (values: D) => Errors<D>;
  onSubmit: (values: D) => Promise<void> | void;
};

export declare type Errors<Values> = {
  [K in keyof Values]?: Values[K] extends any[]
    ? Values[K][number] extends Record<string, unknown>
      ? Errors<Values[K][number]>[] | string | string[]
      : string | string[]
    : Values[K] extends Record<string, unknown>
    ? Errors<Values[K]>
    : string;
};

type Touched<D extends Record<string, unknown>> = {
  [key in keyof D]: boolean;
};

type FormAction = (node: HTMLFormElement) => { destroy: () => void };

export interface Form<D extends Record<string, unknown>> {
  form: FormAction;
  data: Writable<D>;
  errors: Readable<Errors<D>>;
  touched: Writable<Touched<D>>;
  handleSubmit: (e: Event) => void;
  isValid: Readable<boolean>;
  isSubmitting: Writable<boolean>;
}

function isInputElement(el: EventTarget): el is HTMLInputElement {
  return (el as HTMLInputElement)?.nodeName === 'INPUT';
}

function isTextAreaElement(el: EventTarget): el is HTMLTextAreaElement {
  return (el as HTMLTextAreaElement)?.nodeName === 'TEXTAREA';
}

export function createForm<D extends Record<string, unknown>>(
  config: FormConfigWithInitialValues<D>
): Form<D>;
export function createForm<D extends Record<string, unknown>>(
  config: FormConfigWithoutInitialValues<D>
): Form<D | undefined>;
export function createForm<D extends Record<string, unknown>>(
  config: FormConfig<D>
): Form<D | undefined> {
  const initialTouched = Object.keys(config.initialValues || {}).reduce(
    (acc, key) => ({
      ...acc,
      [key]: false,
    }),
    {} as Touched<D>
  );

  const touched = writable(initialTouched);

  const { subscribe, set, update } = writable(
    config.initialValues ? { ...config.initialValues } : undefined
  );

  function newDataSet(values: D) {
    touched.update((current) => {
      const untouchedKeys = Object.keys(current).filter((key) => !current[key]);
      return untouchedKeys.reduce(
        (acc, key) => ({
          ...acc,
          [key]: values[key] !== config.initialValues[key],
        }),
        current
      );
    });
    return set(values);
  }

  const errors = derived({ subscribe }, ($data) => {
    let errors: Errors<D> = {};
    if (config.validate) errors = config.validate($data);
    return errors;
  });

  const { subscribe: errorSubscribe } = derived(
    [errors, touched],
    ([$errors, $touched]) => {
      return Object.keys($errors).reduce(
        (acc, key) => ({
          ...acc,
          ...($touched[key] && { [key]: $errors[key] }),
        }),
        {} as Errors<D>
      );
    }
  );

  const isValid = derived([errors, touched], ([$errors, $touched]) => {
    if (!config.validate) return true;
    const formTouched = Object.keys($touched).some((key) => $touched[key]);
    const hasErrors = Object.keys($errors).some((key) => !!$errors[key]);
    if (!formTouched || hasErrors) return false;
    return true;
  });

  const isSubmitting = writable(false);

  async function handleSubmit(event: Event) {
    isSubmitting.set(true);
    event.preventDefault();
    touched.update((t) => {
      return Object.keys(t).reduce(
        (acc, key) => ({
          ...acc,
          [key]: true,
        }),
        t
      );
    });
    if (Object.keys(get(errors)).length !== 0) return;
    await config.onSubmit(get({ subscribe }));
    isSubmitting.set(false);
  }

  function setFormFieldsDefaultValues(node: HTMLFormElement) {
    const defaultData: Record<string, unknown> = {};
    for (const el of node.elements) {
      if ((!isInputElement(el) && !isTextAreaElement(el)) || !el.name) continue;
      if (isInputElement(el) && el.type === 'checkbox') {
        if (typeof defaultData[el.name] === 'undefined') {
          const checkboxes = node.querySelectorAll(`[name=${el.name}]`);
          if (checkboxes.length === 1) {
            defaultData[el.name] = el.checked;
            continue;
          }
          defaultData[el.name] = el.checked ? [el.value] : [];
          continue;
        }
        if (Array.isArray(defaultData[el.name]) && el.checked) {
          (defaultData[el.name] as string[]).push(el.value);
        }
        continue;
      }
      if (isInputElement(el) && el.type === 'radio' && el.checked) {
        defaultData[el.name] = el.value;
        continue;
      }
      defaultData[el.name] = el.type.match(/^(number|range)$/)
        ? +el.value
        : el.value;
    }
    set(defaultData as D);
  }

  function form(node: HTMLFormElement) {
    setFormFieldsDefaultValues(node);

    function setCheckboxValues(target: HTMLInputElement) {
      const checkboxes = node.querySelectorAll(`[name=${target.name}]`);
      if (checkboxes.length === 1)
        return update((data) => ({ ...data, [target.name]: target.checked }));
      return update((data) => ({
        ...data,
        [target.name]: Array.from(checkboxes)
          .filter((el: HTMLInputElement) => el.checked)
          .map((el: HTMLInputElement) => el.value),
      }));
    }

    function setRadioValues(target: HTMLInputElement) {
      const radios = node.querySelectorAll(`[name=${target.name}]`);
      const checkedRadio = Array.from(radios).find(
        (el) => isInputElement(el) && el.checked
      ) as HTMLInputElement | undefined;
      update((data) => ({ ...data, [target.name]: checkedRadio?.value }));
    }

    function handleInput(e: InputEvent) {
      const target = e.target;
      if (!isInputElement(target) && !isTextAreaElement(target)) return;
      if (target.type === 'checkbox' || target.type === 'radio') return;
      if (!target.name) return;
      touched.update((current) => ({ ...current, [target.name]: true }));
      update((data) => ({
        ...data,
        [target.name]: target.type.match(/^(number|range)$/)
          ? +target.value
          : target.value,
      }));
    }

    function handleChange(e: Event) {
      const target = e.target;
      if (!isInputElement(target)) return;
      if (!target.name) return;
      touched.update((current) => ({ ...current, [target.name]: true }));
      if (target.type === 'checkbox') setCheckboxValues(target);
      if (target.type === 'radio') setRadioValues(target);
    }
    function handleBlur(e: Event) {
      const target = e.target;
      if (!isInputElement(target) && !isTextAreaElement(target)) return;
      if (!target.name) return;
      touched.update((current) => ({ ...current, [target.name]: true }));
    }

    node.addEventListener('input', handleInput);
    node.addEventListener('change', handleChange);
    node.addEventListener('focusout', handleBlur);
    node.addEventListener('submit', handleSubmit);

    return {
      destroy() {
        node.removeEventListener('input', handleInput);
        node.removeEventListener('change', handleChange);
        node.removeEventListener('foucsout', handleBlur);
        node.removeEventListener('submit', handleSubmit);
      },
    };
  }

  return {
    form,
    data: { subscribe, set: newDataSet, update },
    errors: { subscribe: errorSubscribe },
    touched,
    handleSubmit,
    isValid,
    isSubmitting,
  };
}
