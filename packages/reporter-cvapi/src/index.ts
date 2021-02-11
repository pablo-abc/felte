import type {
  CurrentForm,
  ReporterHandler,
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
    const validationMessage: string = target.dataset.felteValidationMessage;
    target.setCustomValidity(validationMessage || '');
  }
}

function cvapiReporter<Data extends Obj = Obj>(
  currentForm: CurrentForm<Data>
): ReporterHandler<Data> {
  const mutationObserver = new MutationObserver(mutationCallback);
  mutationObserver.observe(currentForm.form, mutationConfig);
  return {
    destroy() {
      mutationObserver.disconnect();
    },
    onSubmitError() {
      for (const control of currentForm.controls) {
        if (!control.name) continue;
        const message = control.dataset.felteValidationMessage;
        control.setCustomValidity(message || '');
        if (message) break;
      }
      currentForm.form.reportValidity();
    },
  };
}

export default cvapiReporter;
