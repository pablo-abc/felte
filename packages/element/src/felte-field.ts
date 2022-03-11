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
  static get observedAttributes() {
    return [
      'name',
      'touchonchange',
      'valueprop',
      'inputevent',
      'blurevent',
      'value',
    ];
  }

  attributeChangedCallback(name: string, oldValue: any, newValue: any) {
    if (oldValue === newValue) return;
    switch (name) {
      case 'name':
        this.name = newValue;
        break;
      case 'touchonchange':
        this.touchOnChange = Boolean(newValue);
        break;
      case 'valueprop':
        this.valueProp = newValue;
        break;
      case 'inputevent':
        this.inputEvent = newValue;
        break;
      case 'blurevent':
        this.blurEvent = newValue;
        break;
      case 'value':
        this.value = newValue;
        break;
    }
  }

  name?: string;

  touchOnChange = false;

  valueProp = 'value';

  inputEvent = 'input';

  blurEvent = 'focusout';

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

  private _fieldElement?: HTMLElement;

  private _createField() {
    const {
      name,
      inputEvent,
      blurEvent,
      touchOnChange,
      value: defaultValue,
    } = this;
    if (!name) throw new Error('<felte-field> must have a "name" attribute');
    const element = this.children.item(0) as HTMLElement;
    if (!element) return;
    this._fieldElement = element;
    (element as any)[this.valueProp] = defaultValue;
    const { field, onInput, onBlur } = createField(name, {
      touchOnChange,
      defaultValue,
    });
    this._onInput = onInput;
    this._onBlur = onBlur;
    const { destroy } = field(element);
    const handleInput = (e: Event) => {
      const target = e.target as any;
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

  private _onChildChange = () => {
    const element = this.children.item(0) as HTMLElement;
    if (!element || element === this._fieldElement) return;
    this._fieldElement = element;
    this._destroy?.();
    this._createField();
  };

  private _observer?: MutationObserver;

  connectedCallback() {
    setTimeout(() => {
      if (!this.isConnected || this._destroy) return;
      this._createField();
      this._observer = new MutationObserver(this._onChildChange);
      this._observer.observe(this, { childList: true });
    });
  }

  disconnectedCallback() {
    this._destroy?.();
    this._observer?.disconnect();
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
