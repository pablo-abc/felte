import type { CurrentForm, Obj } from '@felte/common';
import type { ExtenderHandler, Extender } from '@felte/common';
import { createId } from '@felte/common';
import { errorStores, warningStores } from './stores';

export type ReporterOptions = {
  preventFocusOnError?: boolean;
};

function reporterElement<Data extends Obj>(
  currentForm: CurrentForm<Data>,
  options?: ReporterOptions
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
      if (options?.preventFocusOnError) return;
      const firstInvalidElement = currentForm?.form?.querySelector(
        '[data-felte-validation-message]:not([type="hidden"])'
      ) as HTMLElement;
      firstInvalidElement?.focus();
    },
  };
}

export function reporter<Data extends Obj = any>(
  options?: ReporterOptions
): Extender<Data>;
export function reporter<Data extends Obj = any>(
  currentForm: CurrentForm<Data>
): ExtenderHandler<Data>;
export function reporter<Data extends Obj = any>(
  currentFormOrOptions?: CurrentForm<Data> | ReporterOptions
): Extender<Data> | ExtenderHandler<Data> {
  if (!currentFormOrOptions || 'preventFocusOnError' in currentFormOrOptions) {
    return (currentForm: CurrentForm<Data>) =>
      reporterElement(currentForm, currentFormOrOptions);
  }
  return reporterElement(currentFormOrOptions as CurrentForm<Data>);
}
