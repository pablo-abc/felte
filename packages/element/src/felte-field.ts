import type { PropertyValues } from 'lit';
import type { FieldValue } from '@felte/core';
import { LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { createField } from '@felte/core';

function failFor(name: string) {
  return function () {
    throw new TypeError(
      `Can't call "${name}" on HTMLFelteFieldElement. The element is not ready yet.`
    );
  };
}

@customElement('felte-field')
export class FelteField<
  Value extends FieldValue = FieldValue
> extends LitElement {
  @property()
  name?: string;

  @property({ type: Boolean })
  touchOnChange = false;

  @property()
  valueProp = 'value';

  @property()
  inputEvent = 'input';

  @property()
  blurEvent = 'focusout';

  @property()
  value?: Value;

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

  firstUpdated() {
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

  updated(changed: PropertyValues<this>) {
    if (changed.has('value')) {
      this._onInput?.(this.value as Value);
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._destroy?.();
  }

  createRenderRoot() {
    return this;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'felte-field': FelteField;
  }

  type HTMLFelteFieldElement<
    Value extends FieldValue = FieldValue
  > = FelteField<Value>;
}
