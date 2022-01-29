import type {
  CurrentForm,
  ExtenderHandler,
  FormControl,
  Obj,
} from '@felte/common';

const mutationConfig: MutationObserverInit = {
  attributes: true,
  subtree: true,
};

function mutationCallback(mutationList: MutationRecord[]) {
  for (const mutation of mutationList) {
    if (mutation.type !== 'attributes') continue;
    if (mutation.attributeName !== 'data-felte-validation-message') continue;
    const target = mutation.target as FormControl;
    const validationMessage = target.dataset.felteValidationMessage;
    target.setCustomValidity(validationMessage || '');
  }
}

function cvapiReporter<Data extends Obj = Obj>(
  currentForm: CurrentForm<Data>
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
      const firstInvalidElement = form.querySelector(
        '[aria-invalid="true"]:not([type="hidden"])'
      ) as FormControl | null;
      form.reportValidity();
      firstInvalidElement?.focus();
    },
  };
}

export default cvapiReporter;
