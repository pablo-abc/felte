import tippy from 'tippy.js';
import type { Instance, Props } from 'tippy.js';
import type {
  CurrentForm,
  ExtenderHandler,
  FormControl,
  Obj,
  Errors,
  Extender,
  PartialWritableErrors,
} from '@felte/common';
import { isFormControl, getPath } from '@felte/common';
import { _get } from '@felte/common';
import { get } from 'svelte/store';

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
  const elPath =
    isFormControl(el) && getPath(el, el.dataset.felteReporterTippyFor);
  const customPosition = elPath
    ? (form.querySelector(
        `[data-felte-reporter-tippy-position-for="${elPath}"]`
      ) as HTMLElement | null)
    : null;
  return (el as any)?._tippy ?? (customPosition as any)?._tippy;
}

function getControlLabel(control: FormControl): HTMLLabelElement[] {
  const labels = control.labels;
  if (labels && labels.length > 0) return Array.from(labels);
  const labelNode = control.closest('label');
  if (labelNode) return [labelNode];
  if (!control.id) return [];
  const labelElement = document.querySelector(
    `label[for="${control.id}"]`
  ) as HTMLLabelElement | null;
  return labelElement ? [labelElement] : [];
}

export type TippyReporterOptions<Data extends Obj> = {
  setContent?: (
    messages: string[] | undefined,
    path: string
  ) => string | undefined;
  tippyProps?: TippyFieldProps;
  tippyPropsMap?: TippyPropsMap<Data>;
  level?: 'error' | 'warning';
};

function tippyReporter<Data extends Obj = any>({
  setContent,
  level = 'error',
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
    instance.popper.dataset.felteReporterTippyLevel = level;
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
      if (!isFormControl(control)) control.setAttribute('aria-invalid', 'true');
      tippyInstance.setContent(validationMessage);
      !tippyInstance.state.isEnabled && tippyInstance.enable();
      if (document.activeElement === control && !tippyInstance.state.isShown) {
        tippyInstance.show();
      }
    } else {
      if (!isFormControl(control)) control.removeAttribute('aria-invalid');
      tippyInstance.disable();
    }
  }

  let observer: MutationObserver | undefined;
  let tippyInstances: Instance<Props>[] = [];
  let customControls: HTMLElement[] = [];
  let controls: FormControl[] = [];
  let form: HTMLFormElement;
  let store: PartialWritableErrors<Data>;

  return function reporter(
    currentForm: CurrentForm<Data>
  ): ExtenderHandler<Data> {
    if (currentForm.stage === 'SETUP') return {};
    ({ controls, form } = currentForm);
    if (!store) {
      store = level === 'error' ? currentForm.errors : currentForm.warnings;
    }
    customControls = Array.from(
      form.querySelectorAll('[data-felte-reporter-tippy-for]')
    ) as HTMLElement[];

    function createControlInstance(control: HTMLElement) {
      if (!form) return;
      const content = control.dataset.felteValidationMessage;
      if (!isFormControl(control) || !control.name) return;
      const elPath = getPath(control, control.dataset.felteReporterTippyFor);
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
        ...getControlLabel(control),
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
        const elPath = getPath(control, control.dataset.felteReporterTippyFor);
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

    function mutationCallback() {
      if (!form) return;
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
          .map(createCustomControlInstance(get(store)))
          .filter(Boolean) as Instance<Props>[]),
      ];
    }

    if (controls) {
      tippyInstances = controls
        .map(createControlInstance)
        .filter(Boolean) as Instance<Props>[];
    }

    tippyInstances = [
      ...tippyInstances,
      ...(customControls
        .map(createCustomControlInstance(get(store)))
        .filter(Boolean) as Instance<Props>[]),
    ];

    if (!observer) {
      observer = new MutationObserver(mutationCallback);
    }
    observer.observe(form, { childList: true });
    const unsubscribe = store.subscribe(($messages) => {
      for (const control of customControls) {
        const elPath = getPath(control, control.dataset.felteReporterTippyFor);
        if (!elPath) continue;
        const message = _get($messages, elPath) as
          | string
          | string[]
          | undefined;
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
        const elPath = getPath(control, control.dataset.felteReporterTippyFor);
        if (!elPath) continue;
        const message = _get($messages, elPath) as
          | string
          | string[]
          | undefined;
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
        observer?.disconnect();
      },
      onSubmitError({ errors }) {
        if (level !== 'error') return;
        const firstInvalidElement = form.querySelector(
          '[aria-invalid="true"]:not([type="hidden"])'
        ) as FormControl | null;
        firstInvalidElement?.focus();
        const tippyInstance = firstInvalidElement
          ? getTippyInstance(form, firstInvalidElement)
          : undefined;
        if (!tippyInstance || tippyInstance.state.isShown) return;
        const reporterFor =
          firstInvalidElement &&
          getPath(
            firstInvalidElement,
            firstInvalidElement.dataset.felteReporterTippyFor
          );
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
