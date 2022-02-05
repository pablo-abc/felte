/* c8 ignore next */
import type { FormControl } from '../types';

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
