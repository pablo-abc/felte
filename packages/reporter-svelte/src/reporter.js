import { setContext, hasContext } from 'svelte';
import { getPath, _get } from '@felte/common';
import { nanoid } from 'nanoid';
import { errorStores } from './stores';

/**
 *
 * @param {any} currentForm
 */
export function svelteReporter(currentForm) {
  const config = currentForm.config;
  if (!config.__felteReporterSvelteId) {
    const id = nanoid();
    config.__felteReporterSvelteId = id;
    errorStores[id] = currentForm.errors;
  }
  if (!currentForm.form) return;
  if (!currentForm.form.hasAttribute('data-felte-reporter-svelte-id')) {
    currentForm.form.dataset.felteReporterSvelteId =
      config.__felteReporterSvelteId;
  }
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
      firstInvalidElement?.focus();
    },
  };
}
