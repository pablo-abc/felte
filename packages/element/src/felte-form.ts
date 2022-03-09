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
) {
  window.__FELTE__.configs[id] = config;
}

@customElement('felte-form')
export class FelteForm<Data extends Obj = any> extends LitElement {
  @property()
  id = '';

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

  setData: ObjectSetter<Data, Paths<Data>> = () => undefined;

  setFields: FieldsSetter<Data, Paths<Data>> = () => undefined;

  setInitialValues: Helpers<Data, Paths<Data>>['setInitialValues'] = () =>
    undefined;

  addField: Helpers<Data, Paths<Data>>['addField'] = () => undefined;

  unsetField: Helpers<Data, Paths<Data>>['unsetField'] = () => undefined;

  swapFields: Helpers<Data, Paths<Data>>['swapFields'] = () => undefined;

  moveField: Helpers<Data, Paths<Data>>['moveField'] = () => undefined;

  resetField: Helpers<Data, Paths<Data>>['resetField'] = () => undefined;

  reset: Helpers<Data, Paths<Data>>['reset'] = () => undefined;

  submit: () => void = () => undefined;

  createSubmitHandler: Form<Data>['createSubmitHandler'] = () => () =>
    undefined;

  get errors() {
    return this._storeValues.errors;
  }

  setErrors: Helpers<Data, Paths<Data>>['setErrors'] = () => undefined;

  get touched() {
    return this._storeValues.touched;
  }

  setTouched: Helpers<Data, Paths<Data>>['setTouched'] = () => undefined;

  get warnings() {
    return this._storeValues.warnings;
  }

  setWarnings: Helpers<Data, Paths<Data>>['setWarnings'] = () => undefined;

  get isSubmitting() {
    return this._storeValues.isSubmitting;
  }

  setIsSubmitting: Helpers<Data, Paths<Data>>['setIsSubmitting'] = () =>
    undefined;

  get isDirty() {
    return this._storeValues.isDirty;
  }

  setIsDirty: Helpers<Data, Paths<Data>>['setIsDirty'] = () => undefined;

  get isValid() {
    return this._storeValues.isValid;
  }

  get isValidating() {
    return this._storeValues.isValidating;
  }

  get interacted() {
    return this._storeValues.interacted;
  }

  private _readyResolve?: (value: boolean) => void;

  private _ready = new Promise<boolean>((resolve) => {
    this._readyResolve = resolve;
  });

  get ready() {
    return this._ready;
  }

  setInteracted: Helpers<Data, Paths<Data>>['setInteracted'] = () => undefined;

  validate: Helpers<Data, Paths<Data>>['validate'] = async () =>
    ({} as Errors<Data>);

  @queryAssignedElements({ selector: 'form', flatten: true })
  formElements!: HTMLFormElement[];

  private destroy?: () => void;

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

  firstUpdated() {
    const [formElement] = this.formElements;
    if (!formElement || this.destroy) return;
    this.elements = formElement.elements;
    const { configs } = window.__FELTE__;
    let config = {};
    if (this.id) {
      config = configs[this.id];
    }

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
    const unsubs = storeKeys.map((key) => {
      return (rest[key as keyof typeof rest] as Readable<any>).subscribe(
        ($value) => {
          if (isEqual($value, this._storeValues[key as string])) return;
          this._storeValues[key as string] = $value;
          this.dispatchEvent(new Event(`${key.toLowerCase()}change`));
        }
      );
    });
    const { destroy } = form(formElement);
    formElement.addEventListener('feltesubmit', this._handleFelteSubmit);
    formElement.addEventListener('feltesuccess', this._handleFelteSuccess);
    formElement.addEventListener('felteerror', this._handleFelteError);
    this.destroy = () => {
      destroy();
      cleanup();
      formElement.removeEventListener('feltesubmit', this._handleFelteSubmit);
      formElement.removeEventListener('feltesuccess', this._handleFelteSuccess);
      formElement.removeEventListener('felteerror', this._handleFelteError);
      unsubs.forEach((unsub) => unsub());
    };
    this._readyResolve?.(true);
    this.dispatchEvent(new Event('ready'));
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.destroy?.();
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
