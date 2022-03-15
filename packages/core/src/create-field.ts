import type { FieldValue, FormControl } from '@felte/common';
import { isFormControl, setControlValue, isElement } from '@felte/common';

export type FieldConfig = {
  name: string;
  touchOnChange?: boolean;
  defaultValue?: FieldValue;
  onReset?(e: ResetEvent): void;
};

export type Field = {
  field(node: HTMLElement): { destroy?(): void };
  onInput(value: FieldValue): void;
  onChange(value: FieldValue): void;
  onBlur(): void;
};

type EventType = 'input' | 'change' | 'focusout';

type ResetEvent = Event & { target: HTMLFormElement };

const observerConfig = {
  attributes: true,
  attributeFilter: ['data-felte-validation-message', 'aria-invalid'],
};

export function createField(
  name: string,
  config?: Omit<FieldConfig, 'name'>
): Field;
export function createField(config: FieldConfig): Field;
export function createField(
  nameOrConfig: FieldConfig | string,
  config?: Omit<FieldConfig, 'name'>
): Field;
export function createField(
  nameOrConfig: FieldConfig | string,
  config?: Omit<FieldConfig, 'name'>
): Field {
  let name: string;
  let defaultValue: FieldValue;
  let touchOnChange: boolean;
  let fieldNode: HTMLElement;
  let control: FormControl;
  let onReset: ((e: ResetEvent) => void) | undefined;

  if (typeof nameOrConfig === 'string') {
    name = nameOrConfig;
    defaultValue = config?.defaultValue;
    touchOnChange = config?.touchOnChange ?? false;
    onReset = config?.onReset;
  } else {
    name = nameOrConfig.name;
    defaultValue = nameOrConfig.defaultValue;
    touchOnChange = nameOrConfig.touchOnChange ?? false;
    onReset = nameOrConfig?.onReset;
  }

  function dispatchEvent(eventType: 'focusout'): void;
  function dispatchEvent(
    eventType: 'input' | 'change',
    value: FieldValue
  ): void;
  function dispatchEvent(eventType: EventType, value?: FieldValue): void {
    if (!control) return;
    setControlValue(control, value);
    const customEvent = new Event(eventType, {
      bubbles: true,
      cancelable: true,
    });
    control.dispatchEvent(customEvent);
  }

  function mutationCallback(mutationList: MutationRecord[]) {
    mutationList.forEach(() => {
      const invalid = control.getAttribute('aria-invalid');
      if (!invalid) fieldNode.removeAttribute('aria-invalid');
      else fieldNode.setAttribute('aria-invalid', invalid);
      const validationMessage = control.getAttribute(
        'data-felte-validation-message'
      );
      if (!validationMessage)
        fieldNode.removeAttribute('data-felte-validation-message');
      else
        fieldNode.setAttribute(
          'data-felte-validation-message',
          validationMessage
        );
    });
  }

  function handleReset(e: Event) {
    setControlValue(control, defaultValue);
    onReset?.(e as ResetEvent);
  }

  function field(node: HTMLElement) {
    fieldNode = node;
    let observer: MutationObserver;
    let formElement: HTMLFormElement | null;
    if (isFormControl(node)) {
      control = node;
      control.name = name;
      return {};
    } else {
      // This setTimeout is necessary to guarantee the node has been mounted
      setTimeout(() => {
        const parent = fieldNode.parentNode;
        if (!parent || !isElement(parent)) return;
        const foundControl = parent.querySelector(`[name="${name}"]`);
        if (!foundControl || !isFormControl(foundControl)) {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = name;
          parent.insertBefore(input, node.nextSibling);
          control = input;
        } else {
          control = foundControl;
        }
        setControlValue(control, defaultValue);

        observer = new MutationObserver(mutationCallback);
        observer.observe(control, observerConfig);
        formElement = control.closest('form');
        formElement?.addEventListener('reset', handleReset);
      });
      return {
        destroy() {
          observer?.disconnect();
          formElement?.removeEventListener('reset', handleReset);
        },
      };
    }
  }

  function onInput(value: FieldValue) {
    dispatchEvent(touchOnChange ? 'change' : 'input', value);
  }

  function onBlur() {
    dispatchEvent('focusout');
  }
  return {
    field,
    onInput,
    onChange: onInput,
    onBlur,
  };
}
