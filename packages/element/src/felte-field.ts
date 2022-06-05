import type { FieldValue } from '@felte/core';
import { FelteField } from './FelteField';

if (!customElements.get('felte-field')) {
  customElements.define('felte-field', FelteField);
  window.HTMLFelteFieldElement = FelteField;
}

declare global {
  interface HTMLElementTagNameMap {
    'felte-field': FelteField;
  }

  interface Window {
    HTMLFelteFieldElement: {
      new <
        Value extends FieldValue = FieldValue
      >(): HTMLFelteFieldElement<Value>;
    };
  }

  type HTMLFelteFieldElement<
    Value extends FieldValue = FieldValue
  > = FelteField<Value>;
}
