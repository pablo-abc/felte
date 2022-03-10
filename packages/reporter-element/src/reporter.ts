import type { CurrentForm, Obj } from '@felte/common';
import type { ExtenderHandler } from '@felte/common';
import { createId } from '@felte/common';
import { errorStores, warningStores } from './stores';

export function reporter<Data extends Obj>(
  currentForm: CurrentForm<Data>
): ExtenderHandler<Data> {
  const config = currentForm.config;
  if (currentForm.stage === 'SETUP') {
    if (!config.__felteReporterElementId) {
      const id = createId(21);
      config.__felteReporterElementId = id;
      errorStores[id] = currentForm.errors;
      warningStores[id] = currentForm.warnings;
    }
    return {};
  }
  if (!currentForm.form.hasAttribute('data-felte-reporter-element-id')) {
    currentForm.form.dataset.felteReporterElementId = config.__felteReporterElementId as string;
    currentForm.form.dispatchEvent(new Event('feltereporterelement:load'));
  }
  return {
    onSubmitError() {
      const firstInvalidElement = currentForm?.form?.querySelector(
        '[data-felte-validation-message]:not([type="hidden"])'
      ) as HTMLElement;
      firstInvalidElement?.focus();
    },
  };
}
