import type { FieldValue, DispatchEvent } from '@felte/core';
import { isFormControl, getPath } from '@felte/core';

function dispatchEventOnChange(
  node: HTMLElement,
  eventType: string,
  defaultValue?: FieldValue
) {
  const name = node.dataset.felteName;
  if (!name && !(isFormControl(node) && node.name)) return;
  function dispatchEvent(value: FieldValue, eventType: string) {
    const customEvent: DispatchEvent = new CustomEvent(eventType, {
      detail: { value, path: getPath(node, name) },
      bubbles: true,
    });
    node.dispatchEvent(customEvent);
  }

  if (typeof defaultValue !== 'undefined')
    setTimeout(() => dispatchEvent(defaultValue, 'felteLoadField'));
  return {
    update(value: FieldValue) {
      dispatchEvent(value, eventType);
    },
  };
}

export function dispatchInput(node: HTMLElement, defaultValue?: FieldValue) {
  return dispatchEventOnChange(node, 'input', defaultValue);
}

export function dispatchChange(node: HTMLElement, defaultValue?: FieldValue) {
  return dispatchEventOnChange(node, 'change', defaultValue);
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
