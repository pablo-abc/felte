import type { Obj, FormConfig, Keyed, Errors, Touched } from '@felte/core';
import { LitElement, html } from 'lit';
import {
  customElement,
  queryAssignedElements,
  property,
} from 'lit/decorators.js';
import { createForm, isEqual } from '@felte/core';
import { writable } from './stores';

type StoreValues<Data extends Obj> = {
  [key: string]: unknown;

  data?: Keyed<Data>;

  errors?: Errors<Data>;

  touched?: Touched<Data>;

  warnings?: Errors<Data>;

  isSubmitting: boolean;

  isDirty: boolean;

  isValid?: boolean;

  isValidating: boolean;

  interacted: string | null;
};

if (typeof window !== 'undefined' && !window.__FELTE__) {
  window.__FELTE__ = {
    configs: {},
  };
}

export function prepareForm<Data extends Obj = any>(
  id: string,
  config: FormConfig<Data>
) {
  window.__FELTE__.configs[id] = config;
}

@customElement('felte-form')
export class FelteForm<Data extends Obj = any> extends LitElement {
  @property()
  id = '';

  /* Stores (observables) */
  private _storeValues: StoreValues<Data> = {
    data: undefined,
    errors: undefined,
    touched: undefined,
    warnings: undefined,
    isSubmitting: false,
    isDirty: false,
    isValid: undefined,
    isValidating: false,
    interacted: null,
  };

  get data() {
    return this._storeValues.data;
  }

  get errors() {
    return this._storeValues.errors;
  }

  get touched() {
    return this._storeValues.touched;
  }

  get warnings() {
    return this._storeValues.warnings;
  }

  get isSubmitting() {
    return this._storeValues.isSubmitting;
  }

  get isDirty() {
    return this._storeValues.isDirty;
  }

  get isValid() {
    return this._storeValues.isValid;
  }

  get isValidating() {
    return this._storeValues.isValidating;
  }

  get interacted() {
    return this._storeValues.interacted;
  }

  @queryAssignedElements({ selector: 'form', flatten: true })
  formElements!: HTMLFormElement[];

  private destroy?: () => void;

  handleSlotChange() {
    const [formElement] = this.formElements;
    if (!formElement || this.destroy) return;
    const { configs } = window.__FELTE__;
    let config = {};
    if (this.id) {
      config = configs[this.id];
    }

    const {
      form,
      data,
      errors,
      touched,
      warnings,
      isSubmitting,
      isDirty,
      isValid,
      isValidating,
      interacted,
      cleanup,
    } = createForm<Data>(config, {
      storeFactory: writable,
    });
    const stores = {
      data,
      errors,
      touched,
      warnings,
      isSubmitting,
      isDirty,
      isValid,
      isValidating,
      interacted,
    };
    const storeKeys = Object.keys(stores) as (keyof typeof stores)[];
    const unsubs = storeKeys.map((key) => {
      return stores[key].subscribe(($value) => {
        if (isEqual($value, this._storeValues[key as string])) return;
        this._storeValues[key as string] = $value;
        this.dispatchEvent(
          new Event(`${key.toLowerCase()}change`, {
            bubbles: true,
            composed: true,
          })
        );
      });
    });
    const { destroy } = form(formElement);
    this.destroy = () => {
      destroy();
      cleanup();
      unsubs.forEach((unsub) => unsub());
    };
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.destroy?.();
  }

  render() {
    return html`<slot @slotchange=${this.handleSlotChange}></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'felte-form': FelteForm;
  }

  type HTMLFelteFormElement<Data extends Obj> = FelteForm<Data>;

  interface Window {
    __FELTE__: {
      configs: Record<string, FormConfig<any>>;
    };
  }
}
