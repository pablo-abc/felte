export { FelteSubmitError } from '@felte/core';
export type {
  FelteSubmitEvent,
  FelteErrorEvent,
  FelteSuccessEvent,
} from '@felte/core';
import type { Obj } from '@felte/core';
import { FelteForm } from './FelteForm';

if (!customElements.get('felte-form')) {
  customElements.define('felte-form', FelteForm);
  window.HTMLFelteFormElement = FelteForm;
}

declare global {
  interface HTMLElementTagNameMap {
    'felte-form': FelteForm;
  }

  interface Window {
    HTMLFelteFormElement: {
      new <Data extends Obj = any>(): HTMLFelteFormElement<Data>;
    };
  }
  type HTMLFelteFormElement<Data extends Obj = any> = FelteForm<Data>;
}
