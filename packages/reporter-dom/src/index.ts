import type {
  CurrentForm,
  ReporterHandler,
  FormControl,
  Obj,
  Reporter,
} from '@felte/common';

interface DomReporterOptions {
  listType?: 'ul' | 'ol';
  single?: boolean;
}

const mutationConfig: MutationObserverInit = {
  attributes: true,
  subtree: true,
};

function removeAllChildren(parent: Node): void {
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }
}

function setValidationMessage(
  target: FormControl,
  { listType = 'ul', single }: DomReporterOptions
) {
  if (!target.name || !target.id) return;
  const validationMessage = target.dataset.felteValidationMessage;
  const reporterElement = document.querySelector(
    `[data-felte-reporter-dom-for=${target.id}]`
  );
  if (!reporterElement) return;
  removeAllChildren(reporterElement);
  if (!validationMessage) return;
  if (
    single ||
    reporterElement.hasAttribute('data-felte-reporter-dom-as-single')
  ) {
    const spanElement = document.createElement('span');
    spanElement.dataset.felteReporterDomSingleMessage = '';
    spanElement.innerText = validationMessage;
    reporterElement.appendChild(spanElement);
  }
  if (
    !single ||
    reporterElement.hasAttribute('data-felte-reporter-dom-as-list')
  ) {
    const messages = validationMessage.split('\n');
    const listElement = document.createElement(listType);
    listElement.dataset.felteReporterDomList = '';
    for (const message of messages) {
      const messageElement = document.createElement('li');
      messageElement.dataset.felteReporterDomListMessage = '';
      messageElement.innerText = message;
      listElement.appendChild(messageElement);
    }
    reporterElement.appendChild(listElement);
  }
}

function domReporter<Data extends Obj = Obj>(
  options?: DomReporterOptions
): Reporter<Data> {
  function mutationCallback(mutationList: MutationRecord[]) {
    for (const mutation of mutationList) {
      if (mutation.type !== 'attributes') continue;
      if (mutation.attributeName !== 'data-felte-validation-message') continue;
      const target = mutation.target as FormControl;
      setValidationMessage(target, options || {});
    }
  }

  return (currentForm: CurrentForm<Data>): ReporterHandler<Data> => {
    const form = currentForm.form;
    if (!form) return {};
    const mutationObserver = new MutationObserver(mutationCallback);
    mutationObserver.observe(form, mutationConfig);
    return {
      destroy() {
        mutationObserver.disconnect();
      },
      onSubmitError() {
        const firstInvalidElement = form.querySelector(
          '[data-felte-validation-message]'
        ) as FormControl;
        firstInvalidElement.focus();
      },
    };
  };
}

export default domReporter;
