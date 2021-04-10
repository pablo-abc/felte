import tippy from 'tippy.js';
import type { Instance, Props } from 'tippy.js';
import {
  CurrentForm,
  ReporterHandler,
  FormControl,
  Obj,
  Errors,
  Extender,
  isFormControl,
} from '@felte/common';
import { _get, isFieldSetElement } from '@felte/common';
import { get } from 'svelte/store';

function isLabelElement(node: Node): node is HTMLLabelElement {
  return node.nodeName === 'LABEL';
}

function getPath(el: HTMLElement | FormControl) {
  let path = isFormControl(el) ? el.name : el.dataset.felteReporterTippyFor;
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

type TippyFieldProps = Partial<Omit<Props, 'content'>>;

type TippyPropsMap<Data extends Obj> = {
  [key in keyof Data]?: Data[key] extends Obj
    ? TippyPropsMap<Data[key]>
    : TippyFieldProps;
};

function getTippyInstance(
  form: HTMLFormElement,
  el: HTMLElement
): Instance<Props> | undefined {
  const elPath = isFormControl(el) && getPath(el);
  const customPosition = elPath
    ? (form.querySelector(
        `[data-felte-reporter-tippy-position-for="${elPath}"]`
      ) as HTMLElement | null)
    : null;
  return (el as any)?._tippy ?? (customPosition as any)?._tippy;
}

function getControlLabel(control: FormControl): HTMLLabelElement | undefined {
  const labels = control.labels;
  if (labels?.[0]) return labels[0];
  const parentNode = control.parentNode;
  if (parentNode && isLabelElement(parentNode)) return parentNode;
  if (!control.id) return;
  const labelElement = document.querySelector(
    `label[for="${control.id}"]`
  ) as HTMLLabelElement | null;
  return labelElement || undefined;
}

export type TippyReporterOptions<Data extends Obj> = {
  setContent?: (
    messages: string[] | undefined,
    path: string
  ) => string | undefined;
  tippyProps?: TippyFieldProps;
  tippyPropsMap?: TippyPropsMap<Data>;
};

function tippyReporter<Data extends Obj = Obj>({
  setContent,
  tippyProps,
  tippyPropsMap = {},
}: TippyReporterOptions<Data> = {}): Extender<Data> {
  function setTippyInstance(
    control: HTMLElement,
    triggers: HTMLElement[],
    path: string,
    content?: string
  ) {
    const tippyFieldProps = _get(tippyPropsMap, path, {}) as TippyFieldProps;
    const instance = tippy(control, {
      trigger: 'mouseenter click focusin',
      content: setContent ? setContent(content?.split('\n'), path) : content,
      triggerTarget: triggers,
      ...tippyProps,
      ...tippyFieldProps,
    });
    instance.popper.setAttribute('aria-live', 'polite');
    if (!content) instance.disable();
    return instance;
  }

  function handleMessageChange(
    form: HTMLFormElement,
    control: HTMLElement,
    validationMessage?: string
  ) {
    const tippyInstance = getTippyInstance(form, control);
    if (!tippyInstance) return;
    if (validationMessage) {
      control.setAttribute('aria-invalid', 'true');
      tippyInstance.setContent(validationMessage);
      !tippyInstance.state.isEnabled && tippyInstance.enable();
      if (document.activeElement === control && !tippyInstance.state.isShown) {
        tippyInstance.show();
      }
    } else {
      control.removeAttribute('aria-invalid');
      tippyInstance.disable();
    }
  }

  return function reporter<Data extends Obj = Obj>(
    currentForm: CurrentForm<Data>
  ): ReporterHandler<Data> {
    const { controls, form } = currentForm;
    if (!form) return {};
    let tippyInstances: Instance<Props>[] = [];
    let customControls = Array.from(
      form.querySelectorAll('[data-felte-reporter-tippy-for]')
    ) as HTMLElement[];

    function createControlInstance(control: HTMLElement) {
      if (!form) return;
      const content = control.dataset.felteValidationMessage;
      if (!isFormControl(control) || !control.name) return;
      const elPath = getPath(control);
      if (!elPath) return;
      const customTriggerTarget = Array.from(
        form.querySelectorAll(
          `[data-felte-reporter-tippy-trigger-for="${elPath}"]`
        )
      ) as HTMLElement[];
      const customPosition = form.querySelector(
        `[data-felte-reporter-tippy-position-for="${elPath}"]`
      ) as HTMLElement | null;
      const triggerTarget = [
        control,
        getControlLabel(control),
        ...customTriggerTarget,
      ].filter(Boolean) as HTMLElement[];
      if (control.hasAttribute('data-felte-reporter-tippy-ignore')) return;
      return setTippyInstance(
        customPosition ?? control,
        triggerTarget,
        elPath,
        content
      );
    }

    function createCustomControlInstance(errors: Errors<Data>) {
      return function (control: HTMLElement) {
        if (!form) return;
        const elPath = getPath(control);
        if (!elPath) return;
        const content = _get(errors, elPath) as string | undefined;
        const triggerTarget = Array.from(
          form.querySelectorAll(
            `[data-felte-reporter-tippy-trigger-for="${elPath}"]`
          )
        ) as HTMLElement[];
        const customPosition = form.querySelector(
          `[data-felte-reporter-tippy-position-for="${elPath}"]`
        ) as HTMLElement | null;
        return setTippyInstance(
          customPosition ?? control,
          [control, ...triggerTarget],
          elPath,
          content
        );
      };
    }

    function mutationCallback(mutationList: MutationRecord[]) {
      for (const mutation of mutationList) {
        if (form && mutation.type === 'childList') {
          customControls = Array.from(
            form.querySelectorAll('[data-felte-reporter-tippy-for]')
          ) as HTMLElement[];
          tippyInstances.forEach((instance) => instance.destroy());
          tippyInstances = [
            ...(controls
              ? (controls
                  .map(createControlInstance)
                  .filter(Boolean) as Instance<Props>[])
              : []),
            ...(customControls
              .map(createCustomControlInstance(get(currentForm.errors)))
              .filter(Boolean) as Instance<Props>[]),
          ];
        }
      }
    }

    if (controls) {
      tippyInstances = controls
        .map(createControlInstance)
        .filter(Boolean) as Instance<Props>[];
    }

    tippyInstances = [
      ...tippyInstances,
      ...(customControls
        .map(createCustomControlInstance(get(currentForm.errors)))
        .filter(Boolean) as Instance<Props>[]),
    ];

    const observer = new MutationObserver(mutationCallback);
    observer.observe(form, { childList: true });
    const unsubscribe = currentForm.errors.subscribe(($errors) => {
      for (const control of customControls) {
        const elPath = getPath(control);
        if (!elPath) continue;
        const message = _get($errors, elPath) as string | string[] | undefined;
        const transformedMessage =
          typeof message !== 'undefined' && !Array.isArray(message)
            ? [message]
            : message;
        const validationMessage = setContent
          ? setContent(transformedMessage, elPath)
          : transformedMessage?.join('\n');
        handleMessageChange(form, control, validationMessage);
      }
      if (!controls) return;
      for (const control of controls) {
        const elPath = getPath(control);
        if (!elPath) continue;
        const message = _get($errors, elPath) as string | string[] | undefined;
        const transformedMessage =
          typeof message !== 'undefined' && !Array.isArray(message)
            ? [message]
            : message;
        const validationMessage = setContent
          ? setContent(transformedMessage, elPath)
          : transformedMessage?.join('\n');
        handleMessageChange(form, control, validationMessage);
      }
    });

    return {
      destroy() {
        tippyInstances.forEach((instance) => instance.destroy());
        unsubscribe();
      },
      onSubmitError({ errors }) {
        const firstInvalidElement = form.querySelector(
          '[aria-invalid="true"]'
        ) as FormControl | null;
        firstInvalidElement?.focus();
        const tippyInstance = firstInvalidElement
          ? getTippyInstance(form, firstInvalidElement)
          : undefined;
        if (!tippyInstance || tippyInstance.state.isShown) return;
        const reporterFor = firstInvalidElement && getPath(firstInvalidElement);
        const validationMessage =
          firstInvalidElement?.dataset.felteValidationMessage ??
          (reporterFor ? (_get(errors, reporterFor, '') as string) : '');
        tippyInstance.setContent(validationMessage);
        if (!tippyInstance.state.isEnabled) tippyInstance.enable();
        tippyInstance.show();
      },
    };
  };
}

export default tippyReporter;
