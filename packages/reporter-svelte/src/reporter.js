import { setContext, hasContext } from 'svelte';
import { formKey } from './key';
import { getPath, _get } from '@felte/common';

/**
 *
 * @param {any} currentForm
 */
export function svelteReporter(currentForm) {
  if (!hasContext(formKey)) setContext(formKey, currentForm.errors);
  if (!currentForm.form) return;
  const unsubscribe = currentForm.errors.subscribe(($errors) => {
    for (const control of currentForm.controls) {
      const controlError = _get($errors, getPath(control));
      if (!controlError) {
        control.removeAttribute('aria-invalid');
        continue;
      }
      control.setAttribute('aria-invalid', 'true');
    }
  });
  return {
    destroy() {
      unsubscribe();
    },
    onSubmitError() {
      const firstInvalidElement = currentForm?.form.querySelector(
        '[data-felte-validation-message]'
      );
      firstInvalidElement.focus();
    },
  };
}
