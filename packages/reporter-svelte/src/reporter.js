import { getPath, _get } from '@felte/common';
import { errorStores } from './stores';

function createId(length = 8) {
  let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let str = '';
  for (let i = 0; i < length; i++) {
    str += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return str;
}

export function svelteReporter(currentForm) {
  const config = currentForm.config;
  if (!config.__felteReporterSvelteId) {
    const id = createId(21);
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
      const firstInvalidElement =
        currentForm &&
        currentForm.form.querySelector('[data-felte-validation-message]');
      firstInvalidElement && firstInvalidElement.focus();
    },
  };
}
