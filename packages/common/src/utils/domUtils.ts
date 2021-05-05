import type {
  FormControl,
  Obj,
  FieldValue,
  ValidationFunction,
  Errors,
} from '../types';
import { isFormControl, isFieldSetElement, isInputElement } from './typeGuards';
import { _mergeWith } from './mergeWith';
import { _isPlainObject } from './isPlainObject';
import { _get } from './get';
import { _set } from './set';
import { _update } from './update';
import { getPath } from './getPath';
import { getIndex } from './getIndex';

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
      const index = getIndex(fieldSet);
      const fieldsetName =
        typeof index === 'undefined'
          ? fieldSet.name
          : `${fieldSet.name}[${index}]`;
      element.dataset.felteFieldset = fieldSet.dataset.felteFieldset
        ? `${fieldSet.dataset.felteFieldset}.${fieldsetName}`
        : fieldsetName;
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
): { defaultData: Data } {
  const defaultData = {} as Data;
  for (const el of node.elements) {
    if (isFieldSetElement(el)) addAttrsFromFieldset(el);
    if (!isInputElement(el) || !isFormControl(el) || !el.name) continue;
    const elName = getPath(el);
    const index = getIndex(el);
    if (el.type === 'checkbox') {
      if (typeof _get(defaultData, elName) === 'undefined') {
        const checkboxes = Array.from(
          node.querySelectorAll(`[name="${el.name}"]`)
        ).filter((checkbox) => {
          if (!isFormControl(checkbox)) return false;
          if (typeof index !== 'undefined') {
            const felteIndex = Number(
              (checkbox as HTMLInputElement).dataset.felteIndex
            );
            return felteIndex === index;
          }
          return elName === getPath(checkbox);
        });
        if (checkboxes.length === 1) {
          _set(defaultData, elName, el.checked);
          continue;
        }
        _set(defaultData, elName, el.checked ? [el.value] : []);
        continue;
      }
      if (Array.isArray(_get(defaultData, elName)) && el.checked) {
        _update<Data, string[]>(defaultData, elName, (value) => {
          if (typeof index !== 'undefined' && !Array.isArray(value)) value = [];
          return [...value, el.value];
        });
      }
      continue;
    }
    if (el.type === 'radio') {
      if (_get(defaultData, elName)) continue;
      _set(defaultData, elName, el.checked ? el.value : undefined);
      continue;
    }
    if (el.type === 'file') {
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
  return { defaultData };
}

export function setControlValue(
  el: FormControl,
  value: FieldValue | FieldValue[]
): void {
  if (!isInputElement(el)) return;
  const fieldValue = value;
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
    el.files = null;
    el.value = '';
    return;
  }
  el.value = String(fieldValue || '');
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
