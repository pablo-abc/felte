export {
  FelteSubmitEvent,
  FelteErrorEvent,
  FelteSuccessEvent,
  FelteSubmitError,
} from '@felte/core';
import type { PropertyValues } from 'lit';
import type { Readable } from 'svelte/store';
import type {
  Obj,
  FormConfig,
  Keyed,
  Errors,
  Touched,
  Helpers,
  Form,
  Paths,
  FieldsSetter,
  ObjectSetter,
} from '@felte/core';
import { LitElement, html } from 'lit';
import {
  customElement,
  queryAssignedElements,
  property,
  state,
} from 'lit/decorators.js';
import {
  createForm,
  isEqual,
  FelteSubmitEvent,
  FelteSuccessEvent,
  FelteErrorEvent,
} from '@felte/core';
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
): Promise<HTMLFelteFormElement> {
  window.__FELTE__.configs[id] = config;

  return new Promise((resolve) => {
    function handleReady(e: Event) {
      const felteForm = e.composedPath()[0] as HTMLFelteFormElement;
      if (felteForm.id !== id) return;
      resolve(felteForm);
      document.removeEventListener('felteready', handleReady);
    }
    document.addEventListener('felteready', handleReady);
  });
}

function failFor(name: string) {
  return function () {
    throw new TypeError(
      `Can't call "${name}" on HTMLFelteFormElement. The element is not ready yet.`
    );
  };
}

const storeKeys = [
  'data',
  'errors',
  'touched',
  'warnings',
  'isSubmitting',
  'isDirty',
  'isValid',
  'isValidating',
  'interacted',
];

@customElement('felte-form')
export class FelteForm<Data extends Obj = any> extends LitElement {
  [key: string]: unknown;

  @property()
  id = '';

  @state()
  _configuration: FormConfig<Data> = {};

  setConfiguration(config: FormConfig<Data>) {
    this._configuration = config;
  }

  elements?: HTMLFormElement['elements'];

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

  ondatachange?(data: Data): void;

  setData: ObjectSetter<Data, Paths<Data>> = failFor('setData');

  setFields: FieldsSetter<Data, Paths<Data>> = failFor('setFields');

  setInitialValues: Helpers<Data, Paths<Data>>['setInitialValues'] = failFor(
    'setInitialValues'
  );

  addField: Helpers<Data, Paths<Data>>['addField'] = failFor('addField');

  unsetField: Helpers<Data, Paths<Data>>['unsetField'] = failFor('unsetField');

  swapFields: Helpers<Data, Paths<Data>>['swapFields'] = failFor('swapFields');

  moveField: Helpers<Data, Paths<Data>>['moveField'] = failFor('moveField');

  resetField: Helpers<Data, Paths<Data>>['resetField'] = failFor('resetField');

  reset: Helpers<Data, Paths<Data>>['reset'] = failFor('reset');

  submit: () => void = failFor('submit');

  createSubmitHandler: Form<Data>['createSubmitHandler'] = failFor(
    'createSubmitHandler'
  );

  get errors() {
    return this._storeValues.errors;
  }

  onerrorschange?(errors: Errors<Data>): void;

  setErrors: Helpers<Data, Paths<Data>>['setErrors'] = failFor('setErrors');

  get touched() {
    return this._storeValues.touched;
  }

  ontouchedchange?(touched: Touched<Data>): void;

  setTouched: Helpers<Data, Paths<Data>>['setTouched'] = failFor('setTouched');

  get warnings() {
    return this._storeValues.warnings;
  }

  onwarningschange?(warnings: Errors<Data>): void;

  setWarnings: Helpers<Data, Paths<Data>>['setWarnings'] = failFor(
    'setWarnings'
  );

  get isSubmitting() {
    return this._storeValues.isSubmitting;
  }

  onissubmittingchange?(isSubmitting: boolean): void;

  setIsSubmitting: Helpers<Data, Paths<Data>>['setIsSubmitting'] = failFor(
    'setIsSubmitting'
  );

  get isDirty() {
    return this._storeValues.isDirty;
  }

  onisdirtychange?(isDirty: boolean): void;

  setIsDirty: Helpers<Data, Paths<Data>>['setIsDirty'] = failFor('setIsDirty');

  get isValid() {
    return this._storeValues.isValid;
  }

  onisvalidchange?(isValid: boolean): void;

  get isValidating() {
    return this._storeValues.isValidating;
  }

  onisvalidatingchange?(isValidating: boolean): void;

  get interacted() {
    return this._storeValues.interacted;
  }

  oninteractedchange?(interacted: string | null): void;

  setInteracted: Helpers<Data, Paths<Data>>['setInteracted'] = failFor(
    'setInteracted'
  );

  private _ready = false;
  get ready() {
    return this._ready;
  }

  onfelteready?(element: this): void;

  validate: Helpers<Data, Paths<Data>>['validate'] = failFor('validate');

  @queryAssignedElements({ selector: 'form', flatten: true })
  formElements!: HTMLFormElement[];

  private _destroy?: () => void;

  private _handleFelteSubmit = (e: Event) => {
    const event = e as FelteSubmitEvent;
    const submitEvent = new FelteSubmitEvent();
    this.dispatchEvent(submitEvent);
    if (submitEvent.defaultPrevented) event.preventDefault();
    event.onSubmit = submitEvent.onSubmit;
    event.onSuccess = submitEvent.onSuccess;
    event.onError = submitEvent.onError;
  };

  private _handleFelteSuccess = (e: Event) => {
    const event = e as FelteSuccessEvent;
    const successEvent = new FelteSuccessEvent(event.detail);
    this.dispatchEvent(successEvent);
  };

  private _handleFelteError = (e: Event) => {
    const event = e as FelteErrorEvent;
    const errorEvent = new FelteErrorEvent(event.detail);
    this.dispatchEvent(errorEvent);
    event.errors = errorEvent.errors;
    if (errorEvent.defaultPrevented) event.preventDefault();
  };

  private _createForm(config: FormConfig<Data>) {
    const [formElement] = this.formElements;
    if (!formElement || this._destroy) return;
    this.elements = formElement.elements;

    const { form, cleanup, ...rest } = createForm<Data>(config, {
      storeFactory: writable,
    });
    this.setData = rest.setData;
    this.setFields = rest.setFields;
    this.setErrors = rest.setErrors;
    this.setTouched = rest.setTouched;
    this.setWarnings = rest.setWarnings;
    this.setIsSubmitting = rest.setIsSubmitting;
    this.setIsDirty = rest.setIsDirty;
    this.setInteracted = rest.setInteracted;
    this.setInitialValues = rest.setInitialValues;
    this.validate = rest.validate;
    this.addField = rest.addField;
    this.unsetField = rest.unsetField;
    this.swapFields = rest.swapFields;
    this.moveField = rest.moveField;
    this.resetField = rest.resetField;
    this.reset = rest.reset;
    this.submit = rest.handleSubmit;
    this.createSubmitHandler = rest.createSubmitHandler;

    const unsubs = storeKeys.map((key) => {
      return (rest[key as keyof typeof rest] as Readable<any>).subscribe(
        ($value) => {
          if (isEqual($value, this._storeValues[key as string])) return;
          this._storeValues[key as string] = $value;
          const k = key.toLowerCase();
          const handler = this[`on${k}change`];
          if (typeof handler === 'function') handler($value);
          this.dispatchEvent(new Event(`${k}change`));
        }
      );
    });
    const { destroy } = form(formElement);
    formElement.addEventListener('feltesubmit', this._handleFelteSubmit);
    formElement.addEventListener('feltesuccess', this._handleFelteSuccess);
    formElement.addEventListener('felteerror', this._handleFelteError);
    this._destroy = () => {
      destroy();
      cleanup();
      formElement.removeEventListener('feltesubmit', this._handleFelteSubmit);
      formElement.removeEventListener('feltesuccess', this._handleFelteSuccess);
      formElement.removeEventListener('felteerror', this._handleFelteError);
      unsubs.forEach((unsub) => unsub());
    };
    this._ready = true;
    this.onfelteready?.(this);
    this.dispatchEvent(
      new Event('felteready', { bubbles: true, composed: true })
    );
  }

  connectedCallback() {
    super.connectedCallback();
    const { configs } = window.__FELTE__;
    if (this.id) {
      this._configuration = configs[this.id] || this._configuration;
    }
  }

  updated(changed: PropertyValues<this>) {
    if (changed.has('_configuration')) {
      this._destroy?.();
      this._destroy = undefined;
      this._ready = false;
      this._createForm(this._configuration);
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._destroy?.();
  }

  render() {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'felte-form': FelteForm;
  }

  type HTMLFelteFormElement<Data extends Obj = any> = FelteForm<Data>;

  interface Window {
    __FELTE__: {
      configs: Record<string, FormConfig<any>>;
    };
  }
}
