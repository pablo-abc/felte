import { FelteValidationMessage } from './FelteValidationMessage';

if (!customElements.get('felte-validation-message'))
  customElements.define('felte-validation-message', FelteValidationMessage);

declare global {
  interface HTMLElementTagNameMap {
    'felte-validation-message': FelteValidationMessage;
  }

  type HTMLFelteValidationMessageElement = FelteValidationMessage;
}
