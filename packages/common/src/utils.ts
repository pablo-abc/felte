import type {
  FormControl,
  Obj,
  Touched,
  FieldValue,
  ValidationFunction,
  Errors,
} from './types';

type DeepSetResult<Data extends Obj, Value> = {
  [key in keyof Data]: Data[key] extends Obj
    ? DeepSetResult<Data[key], Value>
    : Value;
};

/** @category Helper */
export function isFieldValue(value: unknown): value is FieldValue {
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
export function _cloneDeep<T extends Record<string, unknown>>(obj: T): T {
  return Object.keys(obj || {}).reduce(
    (res, key) => ({
      ...res,
      [key]: _isPlainObject(obj[key]) ? _cloneDeep(obj[key] as T) : obj[key],
    }),
    {}
  ) as T;
}

/** @ignore */
export function _mergeWith<T extends Obj>(...args: any[]): T {
  const customizer = args.pop();
  const obj = _cloneDeep(args.shift());
  if (args.length === 0) return obj;
  for (const source of args) {
    if (!source) continue;
    const keys = Object.keys(source);
    for (const key of keys) {
      const rsValue = customizer(obj[key], source[key]);
      if (typeof rsValue !== 'undefined') {
        obj[key] = rsValue;
      } else if (_isPlainObject(source[key]) && _isPlainObject(obj[key])) {
        obj[key] = _mergeWith(obj[key], source[key], customizer);
      } else if (_isPlainObject(source[key])) {
        const defaultObj = deepSet(_cloneDeep(source[key]), undefined);
        obj[key] = _mergeWith(defaultObj, source[key], customizer);
      } else if (typeof source[key] !== 'undefined') {
        obj[key] = source[key];
      }
    }
  }
  return obj;
}

/** @ignore */
export function _merge<T extends Obj>(...args: any[]): T {
  return _mergeWith(...args, () => undefined);
}

function defaultsCustomizer(objValue: any, srcValue: any) {
  if (_isPlainObject(objValue) && _isPlainObject(srcValue)) return;
  if (typeof objValue !== 'undefined') return objValue;
}

/** @ignore */
export function _defaultsDeep<T extends Obj>(...args: any[]): T {
  return _mergeWith(...args, defaultsCustomizer);
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
  return typeof value === 'undefined' ? defaultValue : value;
}

/** @ignore */
export function _set<Data extends Obj>(
  obj: Data | undefined,
  path: string,
  value: FieldValue
): Data {
  obj ??= {} as Data;
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
  const foundControls: Set<FormControl> = new Set();
  for (const child of el.children) {
    if (isFormControl(child)) foundControls.add(child);
    if (isFieldSetElement(child)) {
      for (const fieldsetChild of child.elements) {
        if (isFormControl(fieldsetChild)) foundControls.add(fieldsetChild);
      }
    }
    if (child.childElementCount > 0)
      getFormControls(child).forEach((value) => foundControls.add(value));
  }
  return Array.from(foundControls);
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

/** @ignore */
export function getInputTextOrNumber(
  el: FormControl
): string | number | undefined {
  if (el.type.match(/^(number|range)$/)) {
    return !el.value ? undefined : +el.value;
  } else {
    return el.value;
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
    const inputValue = getInputTextOrNumber(el);
    _set(defaultData, elName, inputValue);
  }
  return {
    defaultData,
    defaultTouched,
  };
}

export function setControlValue(el: FormControl, value: FieldValue): void {
  if (isInputElement(el) && el.type === 'checkbox') {
    const checkboxesDefaultData = value;
    if (
      typeof checkboxesDefaultData === 'undefined' ||
      typeof checkboxesDefaultData === 'boolean'
    ) {
      el.checked = !!checkboxesDefaultData;
      return;
    }
    if (Array.isArray(checkboxesDefaultData)) {
      if ((checkboxesDefaultData as string[]).includes(el.value)) {
        el.checked = true;
      } else {
        el.checked = false;
      }
    }
    return;
  }
  if (isInputElement(el) && el.type === 'radio') {
    const radioValue = value;
    if (el.value === radioValue) el.checked = true;
    else el.checked = false;
    return;
  }
  if (isInputElement(el) && el.type === 'file') {
    el.files = null;
    el.value = '';
    return;
  }
  el.value = String(value || '');
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
    setControlValue(el, _get(data, elName));
  }
}

type ErrorField = string | Record<string, unknown> | string[];

function executeCustomizer(objValue?: ErrorField, srcValue?: ErrorField) {
  if (_isPlainObject(objValue) || _isPlainObject(srcValue)) return;
  if (objValue === null) return srcValue;
  if (srcValue === null) return objValue;
  if (!objValue || !srcValue) return;
  if (!Array.isArray(objValue)) objValue = [objValue as string];
  if (!Array.isArray(srcValue)) srcValue = [srcValue as string];
  return [...objValue, ...srcValue];
}

export async function executeValidation<Data extends Obj>(
  values: Data,
  validations?: ValidationFunction<Data>[] | ValidationFunction<Data>
): Promise<ReturnType<ValidationFunction<Data>>> {
  if (!validations) return;
  if (!Array.isArray(validations)) return validations(values);
  const errorArray = await Promise.all(validations.map((v) => v(values)));
  return _mergeWith<Errors<Data>>(...errorArray, executeCustomizer);
}
