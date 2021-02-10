import _get from 'lodash/get';
import _isPlainObject from 'lodash/isPlainObject';
import _mapValues from 'lodash/mapValues';
import _set from 'lodash/set';
import _some from 'lodash/some';
import _update from 'lodash/update';
import type { FormControl, Obj, Touched } from './types';

type DeepSetResult<Data extends Obj, Value> = {
  [key in keyof Data]: Data[key] extends Obj
    ? DeepSetResult<Data[key], Value>
    : Value;
};

export function deepSet<Data extends Obj, Value>(
  obj: Data,
  value: Value
): DeepSetResult<Data, Value> {
  return _mapValues(obj, (prop) =>
    _isPlainObject(prop) ? deepSet(prop as Obj, value) : value
  ) as DeepSetResult<Data, Value>;
}

export function deepSome(obj: Obj, pred: (value: unknown) => boolean): boolean {
  return _some(obj, (value) =>
    _isPlainObject(value) ? deepSome(value as Obj, pred) : pred(value)
  );
}

export function isInputElement(el: EventTarget): el is HTMLInputElement {
  return (el as HTMLInputElement)?.nodeName === 'INPUT';
}

export function isTextAreaElement(el: EventTarget): el is HTMLTextAreaElement {
  return (el as HTMLTextAreaElement)?.nodeName === 'TEXTAREA';
}

export function isSelectElement(el: EventTarget): el is HTMLSelectElement {
  return (el as HTMLSelectElement)?.nodeName === 'SELECT';
}

export function isFieldSetElement(el: EventTarget): el is HTMLFieldSetElement {
  return (el as HTMLFieldSetElement)?.nodeName === 'FIELDSET';
}

export function isFormControl(el: EventTarget): el is FormControl {
  return isInputElement(el) || isTextAreaElement(el) || isSelectElement(el);
}

export function isElement(el: Node): el is Element {
  return el.nodeType === Node.ELEMENT_NODE;
}

export function getPath(el: FormControl): string {
  const fieldSetName = el.dataset.felteFieldset;
  return fieldSetName ? `${fieldSetName}.${el.name}` : el.name;
}

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
        _update(defaultData, elName, (value) => [...value, el.value]);
      }
      continue;
    }
    if (isInputElement(el) && el.type === 'radio') {
      if (_get(defaultData, elName)) continue;
      _set(defaultData, elName, el.checked ? el.value : undefined);
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
  return {
    defaultData,
    defaultTouched,
  };
}
