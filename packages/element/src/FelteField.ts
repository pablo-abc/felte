import type { FieldValue } from '@felte/core';
import { createField } from '@felte/core';

function failFor(name: string) {
  return function () {
    throw new TypeError(
      `Can't call "${name}" on HTMLFelteFieldElement. The element is not ready yet.`
    );
  };
}

function booleanCoverter(value: string) {
  return value === '' || (!!value && value !== 'false');
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
      'target',
    ];
  }

  /** @internal */
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
        converter: booleanCoverter,
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
        converter: booleanCoverter,
        name: 'composed',
      },
      target: {
        converter: String,
        name: 'target',
      },
    };
  }

  attributeChangedCallback(name: string, oldValue: any, newValue: any) {
    if (oldValue === newValue) return;
    const { converter, name: propName } = FelteField.attributeMap[name];
    this[propName] = converter(newValue);
  }

  /**
   * @attr
   */
  name?: string;

  /**
   * @attr touchonchange
   */
  touchOnChange = false;

  /**
   * @attr valueprop
   */
  valueProp = 'value';

  /**
   * @attr inputevent
   */
  inputEvent = 'input';

  /**
   * @attr blurevent
   */
  blurEvent = 'focusout';

  /**
   * @attr
   */
  composed = false;

  /**
   * @attr
   */
  target?: string;

  /** @internal */
  private _value?: Value;
  set value(newValue: Value) {
    this._onInput?.(newValue);
    this._value = newValue;
  }

  /**
   * @attr
   */
  get value() {
    return this._value as Value;
  }

  /** @internal */
  private _onInput?: (value: Value) => void;

  /** @internal */
  private _onBlur: () => void = failFor('blur');

  blur() {
    this._onBlur();
  }

  /** @internal */
  private _destroy?: () => void;

  /** @internal */
  private _ready = false;
  get ready() {
    return this._ready;
  }

  onfeltefieldready?(): void;

  /** @internal */
  private _element?: HTMLElement;

  /** @internal */
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
    const element = this._element;
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

  /** @internal */
  private _updateField = () => {
    const element = this.target
      ? (this.querySelector(this.target) as HTMLElement | null)
      : (this.firstElementChild as HTMLElement | null);
    if (!element || element === this._element) return;
    this._element = element;
    this._destroy?.();
    this._destroy = undefined;
    this._createField();
  };

  /** @internal */
  private _observer?: MutationObserver;

  connectedCallback() {
    setTimeout(() => {
      this._updateField();
      this._observer = new MutationObserver(this._updateField);
      this._observer.observe(this, { childList: true });
    });
  }

  disconnectedCallback() {
    this._destroy?.();
    this._observer?.disconnect();
  }
}
