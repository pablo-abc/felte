import type { FormControl, Obj, Touched, FieldValue } from './types';

type DeepSetResult<Data extends Obj, Value> = {
  [key in keyof Data]: Data[key] extends Obj
    ? DeepSetResult<Data[key], Value>
    : Value;
};

/** @category Helper */
function isFieldValue(value: unknown): value is FieldValue {
  if (Array.isArray(value)) {
    if (value.length === 0) return true;
    return value.some((v) => v instanceof File || typeof v === 'string');
  }
  return (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    value instanceof File
  );
}

/** @ignore */
export function _some(obj: Obj, pred: (value: unknown) => boolean): boolean {
  const keys = Object.keys(obj);
  return keys.some((key) => pred(obj[key]));
}

/** @ignore */
export function _mapValues(
  obj: Obj,
  updater: (value: unknown) => unknown
): Obj {
  const keys = Object.keys(obj);
  return keys.reduce(
    (acc: Obj, key: string) => ({
      ...acc,
      [key]: updater(obj[key]),
    }),
    {}
  );
}

/** @ignore */
export function _get<Data extends Obj, Default = undefined>(
  obj: Data,
  path: string,
  defaultValue?: Default
): FieldValue | Default | undefined {
  const keys = path.split('.');
  let value: any = obj;
  try {
    for (const key of keys) {
      value = value[key];
    }
  } catch {
    return defaultValue;
  }
  return isFieldValue(value) ? value : defaultValue;
}

/** @ignore */
export function _set<Data extends Obj>(
  obj: Data,
  path: string,
  value: FieldValue
): Data {
  const a = path.split('.');
  let o: any = obj;
  while (a.length - 1) {
    const n = a.shift();
    if (!n) continue;
    if (!(n in o)) o[n] = {};
    o = o[n];
  }
  o[a[0]] = value;
  return obj;
}

/** @ignore */
export function _unset<Data extends Obj>(obj: Data, path: string): Data {
  const a = path.split('.');
  let o: any = obj;
  while (a.length - 1) {
    const n = a.shift();
    if (!n) continue;
    if (!(n in o)) o[n] = {};
    o = o[n];
  }
  delete o[a[0]];
  return obj;
}

/** @ignore */
export function _update<Data extends Obj, Value = FieldValue>(
  obj: Data,
  path: string,
  updater: (value: Value) => Value
): Data {
  const a = path.split('.');
  let o: any = obj;
  while (a.length - 1) {
    const n = a.shift();
    if (!n) continue;
    if (!(n in o)) o[n] = {};
    o = o[n];
  }
  o[a[0]] = updater(o[a[0]]);
  return obj;
}

/** @ignore */
export function _isPlainObject(value: unknown): boolean {
  return Object.prototype.toString.call(value) === '[object Object]';
}

/**
 * @category Helper
 */
export function deepSet<Data extends Obj, Value>(
  obj: Data,
  value: Value
): DeepSetResult<Data, Value> {
  return _mapValues(obj, (prop) =>
    _isPlainObject(prop) ? deepSet(prop as Obj, value) : value
  ) as DeepSetResult<Data, Value>;
}

/**
 * @category Helper
 */
export function deepSome(obj: Obj, pred: (value: unknown) => boolean): boolean {
  return _some(obj, (value) =>
    _isPlainObject(value) ? deepSome(value as Obj, pred) : pred(value)
  );
}

/**
 * @category Helper
 */
export function isInputElement(el: EventTarget): el is HTMLInputElement {
  return (el as HTMLInputElement)?.nodeName === 'INPUT';
}

/**
 * @category Helper
 */
export function isTextAreaElement(el: EventTarget): el is HTMLTextAreaElement {
  return (el as HTMLTextAreaElement)?.nodeName === 'TEXTAREA';
}

/**
 * @category Helper
 */
export function isSelectElement(el: EventTarget): el is HTMLSelectElement {
  return (el as HTMLSelectElement)?.nodeName === 'SELECT';
}

/**
 * @category Helper
 */
export function isFieldSetElement(el: EventTarget): el is HTMLFieldSetElement {
  return (el as HTMLFieldSetElement)?.nodeName === 'FIELDSET';
}

/**
 * @category Helper
 */
export function isFormControl(el: EventTarget): el is FormControl {
  return isInputElement(el) || isTextAreaElement(el) || isSelectElement(el);
}

/**
 * @category Helper
 */
export function isElement(el: Node): el is Element {
  return el.nodeType === Node.ELEMENT_NODE;
}

/**
 * @category Helper
 */
export function getPath(el: FormControl): string {
  const fieldSetName = el.dataset.felteFieldset;
  return fieldSetName ? `${fieldSetName}.${el.name}` : el.name;
}

/**
 * @ignore
 */
export function getFormControls(el: Element): FormControl[] {
  if (isFormControl(el)) return [el];
  if (el.childElementCount === 0) return [];
  const foundControls: FormControl[] = [];
  for (const child of el.children) {
    if (isFormControl(child)) foundControls.push(child);
    if (isFieldSetElement(child)) {
      for (const fieldsetChild of child.elements) {
        if (isFormControl(fieldsetChild)) foundControls.push(fieldsetChild);
      }
    }
    if (child.childElementCount > 0)
      foundControls.push(...getFormControls(child));
  }
  return foundControls;
}

/**
 * @ignore
 */
export function addAttrsFromFieldset(fieldSet: HTMLFieldSetElement): void {
  for (const element of fieldSet.elements) {
    if (!isFormControl(element) && !isFieldSetElement(element)) continue;
    if (fieldSet.name && element.name) {
      element.dataset.felteFieldset = fieldSet.dataset.felteFieldset
        ? `${fieldSet.dataset.felteFieldset}.${fieldSet.name}`
        : fieldSet.name;
    }
    if (
      fieldSet.dataset.felteUnsetOnRemove === 'true' &&
      !element.hasAttribute('data-felte-unset-on-remove')
    ) {
      element.dataset.felteUnsetOnRemove = 'true';
    }
  }
}

/**
 * @ignore
 */
export function getFormDefaultValues<Data extends Obj>(
  node: HTMLFormElement
): { defaultData: Data; defaultTouched: Touched<Data> } {
  const defaultData = {} as Data;
  const defaultTouched = {} as Touched<Data>;
  for (const el of node.elements) {
    if (isFieldSetElement(el)) addAttrsFromFieldset(el);
    if (!isFormControl(el) || !el.name) continue;
    const elName = getPath(el);
    _set(defaultTouched, elName, false);
    if (isInputElement(el) && el.type === 'checkbox') {
      if (typeof _get(defaultData, elName) === 'undefined') {
        const checkboxes = node.querySelectorAll(`[name="${el.name}"]`);
        if (checkboxes.length === 1) {
          _set(defaultData, elName, el.checked);
          continue;
        }
        _set(defaultData, elName, el.checked ? [el.value] : []);
        continue;
      }
      if (Array.isArray(_get(defaultData, elName)) && el.checked) {
        _update<Data, string[]>(defaultData, elName, (value) => [
          ...value,
          el.value,
        ]);
      }
      continue;
    }
    if (isInputElement(el) && el.type === 'radio') {
      if (_get(defaultData, elName)) continue;
      _set(defaultData, elName, el.checked ? el.value : undefined);
      continue;
    }
    if (isInputElement(el) && el.type === 'file') {
      _set(
        defaultData,
        elName,
        el.multiple ? Array.from(el.files || []) : el.files?.[0]
      );
      continue;
    }
    _set(
      defaultData,
      elName,
      el.type.match(/^(number|range)$/) ? +el.value : el.value
    );
  }
  return {
    defaultData,
    defaultTouched,
  };
}

/** Sets the form inputs value to match the data object provided. */
export function setForm<Data extends Obj>(
  node: HTMLFormElement,
  data: Data
): void {
  for (const el of node.elements) {
    if (isFieldSetElement(el)) addAttrsFromFieldset(el);
    if (!isFormControl(el) || !el.name) continue;
    const elName = getPath(el);
    if (isInputElement(el) && el.type === 'checkbox') {
      const checkboxesDefaultData = _get(data, elName);
      if (
        typeof checkboxesDefaultData === 'undefined' ||
        typeof checkboxesDefaultData === 'boolean'
      ) {
        el.checked = !!checkboxesDefaultData;
        continue;
      }
      if (Array.isArray(checkboxesDefaultData)) {
        if ((checkboxesDefaultData as string[]).includes(el.value)) {
          el.checked = true;
        } else {
          el.checked = false;
        }
      }
      continue;
    }
    if (isInputElement(el) && el.type === 'radio') {
      const radioValue = _get(data, elName);
      if (el.value === radioValue) el.checked = true;
      else el.checked = false;
      continue;
    }
    if (isInputElement(el) && el.type === 'file') {
      el.files = null;
      el.value = '';
      continue;
    }
    el.value = String(_get(data, elName, ''));
  }
}
