import type { FieldValue } from '@felte/common';
import { getIndex, isFormControl, isFieldSetElement } from '@felte/common';

function getPath(el: HTMLElement, name?: string) {
  const index = getIndex(el);
  let path;
  if (name) {
    path = name;
  } else if (isFormControl(el) && el.name) {
    path = el.name;
  } else return;
  path = typeof index === 'undefined' ? path : `${path}[${index}]`;
  let parent = el.parentNode;
  if (!parent) return path;
  while (parent && parent.nodeName !== 'FORM') {
    if (isFieldSetElement(parent) && parent.name) {
      const index = getIndex(parent);
      const fieldsetName =
        typeof index === 'undefined' ? parent.name : `${parent.name}[${index}]`;
      path = `${fieldsetName}.${path}`;
    }
    parent = parent.parentNode;
  }
  return path;
}

export type DispatchEvent = CustomEvent<{
  value: FieldValue;
  path: string;
}>;

function dispatchEventOnChange(node: HTMLElement, eventType: string) {
  const name = node.dataset.felteName;
  if (!name) return;
  return {
    update(value: FieldValue) {
      const customEvent = new CustomEvent(eventType, {
        detail: { value, path: getPath(node, name) },
        bubbles: true,
      });
      node.dispatchEvent(customEvent);
    },
  };
}

export function dispatchInput(node: HTMLElement) {
  return dispatchEventOnChange(node, 'input');
}

export function dispatchChange(node: HTMLElement) {
  return dispatchEventOnChange(node, 'change');
}

export function dispatchBlur(node: HTMLElement) {
  const name = node.dataset.felteName;
  if (!name) return;
  return {
    update(blurred: boolean) {
      if (!blurred) return;
      const customEvent = new CustomEvent('focusout', {
        detail: { path: getPath(node, name) },
        bubbles: true,
      });
      node.dispatchEvent(customEvent);
    },
  };
}
