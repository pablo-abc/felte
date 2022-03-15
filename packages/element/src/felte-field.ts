import type { FieldValue } from '@felte/core';
import { createField } from '@felte/core';

function failFor(name: string) {
  return function () {
    throw new TypeError(
      `Can't call "${name}" on HTMLFelteFieldElement. The element is not ready yet.`
    );
  };
}

export class FelteField<
  Value extends FieldValue = FieldValue
> extends HTMLElement {
  [key: string]: unknown;
  static get observedAttributes() {
    return [
      'name',
      'touchonchange',
      'valueprop',
      'inputevent',
      'blurevent',
      'composed',
      'value',
    ];
  }

  static get attributeMap(): Record<
    string,
    { converter: (v: any) => any; name: string }
  > {
    return {
      name: {
        converter: String,
        name: 'name',
      },
      touchonchange: {
        converter: (value: string) =>
          value === '' || (!!value && value !== 'false'),
        name: 'touchOnChange',
      },
      valueprop: {
        converter: String,
        name: 'valueProp',
      },
      inputevent: {
        converter: String,
        name: 'inputEvent',
      },
      blurevent: {
        converter: String,
        name: 'blurEvent',
      },
      value: {
        converter: String,
        name: 'value',
      },
      composed: {
        converter: (value: string) =>
          value === '' || (!!value && value !== 'false'),
        name: 'composed',
      },
    };
  }

  attributeChangedCallback(name: string, oldValue: any, newValue: any) {
    if (oldValue === newValue) return;
    const { converter, name: propName } = FelteField.attributeMap[name];
    this[propName] = converter(newValue);
  }

  name?: string;

  touchOnChange = false;

  valueProp = 'value';

  inputEvent = 'input';

  blurEvent = 'focusout';

  composed = false;

  private _value?: Value;
  set value(newValue: Value) {
    this._onInput?.(newValue);
    this._value = newValue;
  }

  get value() {
    return this._value as Value;
  }

  private _onInput?: (value: Value) => void;

  private _onBlur: () => void = failFor('blur');

  blur() {
    this._onBlur();
  }

  private _destroy?: () => void;

  private _ready = false;
  get ready() {
    return this._ready;
  }

  onfeltefieldready?(): void;

  private _createField() {
    const {
      name,
      inputEvent,
      blurEvent,
      touchOnChange,
      value: defaultValue,
      composed,
    } = this;
    if (!name) throw new Error('<felte-field> must have a "name" attribute');
    const element = this.children.item(0) as HTMLElement;
    if (!element) return;
    (element as any)[this.valueProp] = defaultValue;

    const { field, onInput, onBlur } = createField(name, {
      touchOnChange,
      defaultValue,
      onFormReset: () => {
        this.value = defaultValue;
        (element as any)[this.valueProp] = defaultValue;
      },
    });
    this._onInput = onInput;
    this._onBlur = onBlur;
    const { destroy } = field(element);
    const handleInput = (e: Event) => {
      const target = composed ? e.composedPath()[0] : (e.target as any);
      this.value = target[this.valueProp];
    };
    const handleBlur = () => {
      onBlur();
    };
    element.addEventListener(inputEvent, handleInput);
    element.addEventListener(blurEvent, handleBlur);
    this._destroy = () => {
      destroy?.();
      element.removeEventListener(inputEvent, handleInput);
      element.removeEventListener(inputEvent, handleBlur);
    };

    this._ready = true;
    this.onfeltefieldready?.();
    this.dispatchEvent(new Event('feltefieldready'));
  }

  connectedCallback() {
    setTimeout(() => {
      if (!this.isConnected || this._destroy) return;
      this._createField();
    });
  }

  disconnectedCallback() {
    this._destroy?.();
  }
}

if (!customElements.get('felte-field'))
  customElements.define('felte-field', FelteField);

declare global {
  interface HTMLElementTagNameMap {
    'felte-field': FelteField;
  }

  type HTMLFelteFieldElement<
    Value extends FieldValue = FieldValue
  > = FelteField<Value>;
}
