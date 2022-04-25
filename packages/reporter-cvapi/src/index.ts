import type {
  CurrentForm,
  ExtenderHandler,
  FormControl,
  Obj,
  Extender,
} from '@felte/common';

const mutationConfig: MutationObserverInit = {
  attributes: true,
  subtree: true,
};

export type ReporterOptions = {
  preventFocusOnError?: boolean;
};

function mutationCallback(mutationList: MutationRecord[]) {
  for (const mutation of mutationList) {
    if (mutation.attributeName !== 'data-felte-validation-message') continue;
    const target = mutation.target as FormControl;
    const validationMessage = target.dataset.felteValidationMessage;
    target.setCustomValidity(validationMessage || '');
  }
}

function cvapiReporter<Data extends Obj = Obj>(
  currentForm: CurrentForm<Data>,
  options?: ReporterOptions
): ExtenderHandler<Data> {
  if (currentForm.stage === 'SETUP') return {};
  const form = currentForm.form;
  const mutationObserver = new MutationObserver(mutationCallback);
  mutationObserver.observe(form, mutationConfig);
  return {
    destroy() {
      mutationObserver.disconnect();
    },
    onSubmitError() {
      if (options?.preventFocusOnError) return;
      const firstInvalidElement = form.querySelector(
        '[aria-invalid="true"]:not([type="hidden"])'
      ) as FormControl | null;
      form.reportValidity();
      firstInvalidElement?.focus();
    },
  };
}

function reporter<Data extends Obj = any>(
  options?: ReporterOptions
): Extender<Data>;
function reporter<Data extends Obj = any>(
  currentForm: CurrentForm<Data>
): ExtenderHandler<Data>;
function reporter<Data extends Obj = any>(
  currentFormOrOptions?: CurrentForm<Data> | ReporterOptions
): Extender<Data> | ExtenderHandler<Data> {
  if (!currentFormOrOptions || 'preventFocusOnError' in currentFormOrOptions) {
    return (currentForm: CurrentForm<any>) =>
      cvapiReporter(currentForm, currentFormOrOptions);
  }
  return cvapiReporter(currentFormOrOptions as CurrentForm<Data>);
}

export default reporter;
