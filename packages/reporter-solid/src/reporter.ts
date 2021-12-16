import { CurrentForm, Obj } from '@felte/common';
import { getPath, _get } from '@felte/common';
import type { ExtenderHandler } from '@felte/common';
import { errorStores } from './stores';
import { createId } from './utils';

export function reporter<Data extends Obj>(
  currentForm: CurrentForm<Data>
): ExtenderHandler<Data> {
  const config = currentForm.config;
  if (!config.__felteReporterSvelteId) {
    const id = createId(21);
    config.__felteReporterSvelteId = id;
    errorStores[id] = currentForm.errors;
  }
  if (!currentForm.form) return {};
  if (!currentForm.form.hasAttribute('data-felte-reporter-svelte-id')) {
    currentForm.form.dataset.felteReporterSvelteId = config.__felteReporterSvelteId as string;
  }
  const unsubscribe = currentForm.errors.subscribe(($errors) => {
    if (!currentForm.controls) return;
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
      const firstInvalidElement = currentForm?.form?.querySelector(
        '[data-felte-validation-message]'
      ) as HTMLElement;
      firstInvalidElement?.focus();
    },
  };
}
