import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { createForm } from '@felte/vanilla';

if (typeof window !== 'undefined' && !window.__FELTE__) {
  window.__FELTE__ = {
    configs: {},
  };
}

export function prepareForm(id: string, config: any) {
  window.__FELTE__.configs[id] = config;
}

@customElement('felte-form')
export class FelteForm<
  Data extends Record<string, any> = any
> extends LitElement {
  @property({ attribute: false })
  onSubmit?: (values: Data) => void | Promise<void>;

  @property({ attribute: false })
  validate?: (values: any) => any | Promise<any>;

  @property({ attribute: false })
  extend?: any;

  @property()
  id = '';

  destroy?: () => void;

  connectedCallback() {
    super.connectedCallback();
    const configurations = window.__FELTE__.configs;
    if (this.id) {
      const config = configurations[this.id];
      if (!this.onSubmit) this.onSubmit = config.onSubmit;
      if (!this.validate) this.validate = config.validate;
      if (!this.extend) this.extend = config.extend;
    }
    const { form } = createForm<Data>({
      onSubmit: this.onSubmit,
      validate: this.validate,
      extend: this.extend,
    });

    setTimeout(() => {
      const formElement = this.renderRoot
        .querySelector('slot')
        ?.assignedElements({ flatten: true })
        .find((el) => el instanceof HTMLFormElement) as
        | HTMLFormElement
        | undefined;

      if (!formElement) return;
      const { destroy } = form(formElement);
      this.destroy = destroy;
    });
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

  interface Window {
    __FELTE__: {
      configs: Record<string, any>;
    };
  }
}
