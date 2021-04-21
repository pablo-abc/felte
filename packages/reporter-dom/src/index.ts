import type {
  CurrentForm,
  ReporterHandler,
  FormControl,
  Obj,
  Reporter,
  Errors,
} from '@felte/common';
import { isFormControl, isFieldSetElement, _get } from '@felte/common';

export interface DomReporterOptions {
  listType?: 'ul' | 'ol';
  listAttributes?: {
    class?: string | string[];
  };
  listItemAttributes?: {
    class?: string | string[];
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

function getPath(el: HTMLElement | FormControl) {
  let path = isFormControl(el) ? el.name : el.dataset.felteReporterDomFor;
  let parent = el.parentNode;
  if (!parent) return path;
  while (parent && parent.nodeName !== 'FORM') {
    if (isFieldSetElement(parent) && parent.name) {
      const fieldsetName = parent.name;
      path = `${fieldsetName}.${path}`;
    }
    parent = parent.parentNode;
  }
  return path;
}

function setInvalidState(target: FormControl) {
  const validationMessage = target.dataset.felteValidationMessage;
  if (!validationMessage) target.removeAttribute('aria-invalid');
  else target.setAttribute('aria-invalid', 'true');
}

function setValidationMessage<Data extends Obj>(
  reporterElement: HTMLElement,
  errors: Errors<Data>,
  { listType = 'ul', listAttributes, listItemAttributes, single, singleAttributes }: DomReporterOptions
) {
  const elPath = getPath(reporterElement);
  if (!elPath) return;
  const validationMessage = _get(errors, elPath, '') as string | string[];
  removeAllChildren(reporterElement);
  if (!validationMessage) return;
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
    const textNode = document.createTextNode(
      Array.isArray(validationMessage)
        ? validationMessage[0] ?? ''
        : validationMessage
    );
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
    const messages = Array.isArray(validationMessage)
      ? validationMessage
      : [validationMessage];
    const listElement = document.createElement(listType);
    listElement.dataset.felteReporterDomList = '';
    for (const message of messages) {
      const messageElement = document.createElement('li');
      messageElement.dataset.felteReporterDomListMessage = '';
      const textNode = document.createTextNode(message);
      messageElement.appendChild(textNode);
      let classes = listItemAttributes?.class
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
      setInvalidState(target);
    }
  }

  return (currentForm: CurrentForm<Data>): ReporterHandler<Data> => {
    const form = currentForm.form;
    if (!form) return {};
    const mutationObserver = new MutationObserver(mutationCallback);
    mutationObserver.observe(form, mutationConfig);
    const unsubscribe = currentForm.errors.subscribe(($errors) => {
      const elements = form.querySelectorAll('[data-felte-reporter-dom-for]');
      for (const element of elements) {
        setValidationMessage(element as HTMLElement, $errors, options ?? {});
      }
    });
    return {
      destroy() {
        mutationObserver.disconnect();
        unsubscribe();
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
