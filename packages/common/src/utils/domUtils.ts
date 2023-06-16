import type { FormControl, Obj, FieldValue, Touched } from '../types';
import {
  isFormControl,
  isFieldSetElement,
  isInputElement,
  isSelectElement,
} from './typeGuards';
import { _get } from './get';
import { _set } from './set';
import { _update } from './update';
import { getPath } from './getPath';

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
    if (
      fieldSet.hasAttribute('data-felte-keep-on-remove') &&
      !element.hasAttribute('data-felte-keep-on-remove')
    ) {
      element.dataset.felteKeepOnRemove = fieldSet.dataset.felteKeepOnRemove;
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
  let defaultData = {} as Data;
  let defaultTouched = {} as Touched<Data>;
  for (const el of node.elements) {
    if (isFieldSetElement(el)) addAttrsFromFieldset(el);
    if (!isFormControl(el) || !el.name) continue;
    const elName = getPath(el);
    if (isInputElement(el)) {
      if (el.type === 'checkbox') {
        if (typeof _get(defaultData, elName) === 'undefined') {
          const checkboxes = Array.from(
            node.querySelectorAll(`[name="${el.name}"]`)
          ).filter((checkbox) => {
            if (!isFormControl(checkbox)) return false;
            return elName === getPath(checkbox);
          });
          if (checkboxes.length === 1) {
            defaultData = _set(defaultData, elName, el.checked);
            defaultTouched = _set(defaultTouched, elName, false);
            continue;
          }
          defaultData = _set(defaultData, elName, el.checked ? [el.value] : []);
          defaultTouched = _set(defaultTouched, elName, false);
          continue;
        }
        if (Array.isArray(_get(defaultData, elName)) && el.checked) {
          defaultData = _update<Data>(defaultData, elName, (value) => [
            ...value,
            el.value,
          ]);
        }
        continue;
      }
      if (el.type === 'radio') {
        if (_get(defaultData, elName)) continue;
        defaultData = _set(
          defaultData,
          elName,
          el.checked ? el.value : undefined
        );
        defaultTouched = _set(defaultTouched, elName, false);
        continue;
      }
      if (el.type === 'file') {
        defaultData = _set(
          defaultData,
          elName,
          el.multiple ? Array.from(el.files || []) : el.files?.[0]
        );
        defaultTouched = _set(defaultTouched, elName, false);
        continue;
      }
    } else if (isSelectElement(el)) {
      const multiple = el.multiple;
      if (!multiple) {
        defaultData = _set(defaultData, elName, el.value);
      } else {
        const selectedOptions = Array.from(el.selectedOptions).map(
          (opt) => opt.value
        );
        defaultData = _set(defaultData, elName, selectedOptions);
      }
      defaultTouched = _set(defaultTouched, elName, false);
      continue;
    }
    const inputValue = getInputTextOrNumber(el);
    defaultData = _set(defaultData, elName, inputValue);
    defaultTouched = _set(defaultTouched, elName, false);
  }
  return { defaultData, defaultTouched };
}

export function setControlValue(
  el: FormControl,
  value: FieldValue | FieldValue[] | FileList
): void {
  if (!isFormControl(el)) return;
  const fieldValue = value;

  if (isInputElement(el)) {
    if (el.type === 'checkbox') {
      const checkboxesDefaultData = fieldValue;
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
    if (el.type === 'radio') {
      const radioValue = fieldValue;
      if (el.value === radioValue) el.checked = true;
      else el.checked = false;
      return;
    }
    if (el.type === 'file') {
      if (value instanceof FileList) {
        el.files = value;
      } else if (value instanceof File && typeof DataTransfer !== 'undefined') {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(value);
        el.files = dataTransfer.files;
      } else if (
        typeof DataTransfer !== 'undefined' &&
        Array.isArray(value) &&
        value.some((v) => v instanceof File)
      ) {
        const dataTransfer = new DataTransfer();
        for (const file of value) {
          file instanceof File && dataTransfer.items.add(file as File);
        }
        el.files = dataTransfer.files;
      } else if (!value || (Array.isArray(value) && !value.length)) {
        el.files = null;
        el.value = '';
      }
      return;
    }
  } else if (isSelectElement(el)) {
    const multiple = el.multiple;
    if (!multiple) {
      el.value = String(fieldValue ?? '');
      for (const option of el.options) {
        if (option.value === String(fieldValue)) {
          option.selected = true;
        } else {
          option.selected = false;
        }
      }
    } else if (Array.isArray(fieldValue)) {
      el.value = String(fieldValue[0] ?? '');
      const stringValues = fieldValue.map((v) => String(v));
      for (const option of el.options) {
        if (stringValues.includes(option.value)) {
          option.selected = true;
        } else {
          option.selected = false;
        }
      }
    }
    return;
  }

  el.value = String(fieldValue ?? '');
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
