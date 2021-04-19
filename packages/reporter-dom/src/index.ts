import type {
  CurrentForm,
  ReporterHandler,
  FormControl,
  Obj,
  Reporter,
} from '@felte/common';

export interface DomReporterOptions {
  listType?: 'ul' | 'ol';
  listAttributes?: {
    class?: string | string[];
    itemClass?: string | string[];
  };
  single?: boolean;
  singleAttributes?: {
    class?: string | string[];
  };
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
  { listType = 'ul', listAttributes, single, singleAttributes }: DomReporterOptions
) {
  if (!target.name || !target.id) return;
  const validationMessage = target.dataset.felteValidationMessage;
  const reporterElement = document.querySelector(
    `[data-felte-reporter-dom-for=${target.id}]`
  );
  if (!reporterElement) return;
  removeAllChildren(reporterElement);
  if (!validationMessage) {
    target.removeAttribute('aria-invalid');
    return;
  }
  target.setAttribute('aria-invalid', 'true');
  const reportAsSingle =
    (single &&
      !reporterElement.hasAttribute('data-felte-reporter-dom-as-list')) ||
    reporterElement.hasAttribute('data-felte-reporter-dom-as-single');
  const reportAsList =
    (!single &&
      !reporterElement.hasAttribute('data-felte-reporter-dom-as-single')) ||
    reporterElement.hasAttribute('data-felte-reporter-dom-as-list');
  if (reportAsSingle) {
    const spanElement = document.createElement('span');
    spanElement.setAttribute('aria-live', 'polite');
    spanElement.dataset.felteReporterDomSingleMessage = '';
    const textNode = document.createTextNode(validationMessage);
    spanElement.appendChild(textNode);
    let classes = singleAttributes?.class
    if(classes) {
      if (!Array.isArray(classes)) {
        classes = classes.split(' ')
      }
      spanElement.classList.add(...classes)
    }
    reporterElement.appendChild(spanElement);
  }
  if (reportAsList) {
    const messages = validationMessage.split('\n');
    const listElement = document.createElement(listType);
    listElement.dataset.felteReporterDomList = '';
    for (const message of messages) {
      const messageElement = document.createElement('li');
      messageElement.dataset.felteReporterDomListMessage = '';
      const textNode = document.createTextNode(message);
      messageElement.appendChild(textNode);
      let classes = listAttributes?.itemClass
      if(classes) {
        if (!Array.isArray(classes)) {
          classes = classes.split(' ')
        }
        listElement.classList.add(...classes)
      }
      listElement.appendChild(messageElement);
    }
    let classes = listAttributes?.class
    if(classes) {
      if (!Array.isArray(classes)) {
        classes = classes.split(' ')
      }
      reporterElement.classList.add(...classes)
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
