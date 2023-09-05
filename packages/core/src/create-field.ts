import type { FieldValue, FormControl } from '@felte/common';
import { isFormControl, setControlValue, isElement } from '@felte/common';

export type FieldConfig = {
  name: string;
  touchOnChange?: boolean;
  defaultValue?: FieldValue;
  onFormReset?(e: ResetEvent): void;
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
  let onFormReset: ((e: ResetEvent) => void) | undefined;

  if (typeof nameOrConfig === 'string') {
    name = nameOrConfig;
    defaultValue = config?.defaultValue;
    touchOnChange = config?.touchOnChange ?? false;
    onFormReset = config?.onFormReset;
  } else {
    name = nameOrConfig.name;
    defaultValue = nameOrConfig.defaultValue;
    touchOnChange = nameOrConfig.touchOnChange ?? false;
    onFormReset = nameOrConfig?.onFormReset;
  }

  function dispatchEvent(eventType: 'focusout'): void;
  function dispatchEvent(
    eventType: 'input' | 'change',
    value: FieldValue
  ): void;
  function dispatchEvent(eventType: EventType, value?: FieldValue): void {
    if (!control) return;
    if (eventType !== 'focusout')
      setControlValue(control, value);
    const customEvent = new Event(eventType, {
      bubbles: true,
      composed: true,
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
    if (!onFormReset) return;
    setControlValue(control, defaultValue);
    onFormReset(e as ResetEvent);
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
      let created = false;
      let destroyed = false;
      setTimeout(() => {
        if (destroyed) return;
        const parent = fieldNode.parentNode;
        if (!parent || !isElement(parent)) return;
        const foundControl = parent.querySelector(`[name="${name}"]`);
        if (!foundControl || !isFormControl(foundControl)) {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = name;
          parent.insertBefore(input, node.nextSibling);
          control = input;
          created = true;
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
          if (created) control.parentNode?.removeChild(control);
          destroyed = true;
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
