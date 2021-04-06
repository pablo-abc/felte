import tippy from 'tippy.js';
import type { Instance, Props } from 'tippy.js';
import type {
  CurrentForm,
  ReporterHandler,
  FormControl,
  Obj,
  Extender,
} from '@felte/common';
import { getPath, _get } from '@felte/common';

const mutationConfig: MutationObserverInit = {
  attributes: true,
  subtree: true,
};

function isLabelElement(node: Node): node is HTMLLabelElement {
  return node.nodeName === 'LABEL';
}

type TippyFieldProps = Partial<Omit<Props, 'content'>>;

type TippyPropsMap<Data extends Obj> = {
  [key in keyof Data]?: Data[key] extends Obj
    ? TippyPropsMap<Data[key]>
    : TippyFieldProps;
};

function getControlLabel(control: FormControl): HTMLLabelElement | undefined {
  const labels = control.labels;
  if (labels?.[0]) return labels[0];
  const parentNode = control.parentNode;
  if (parentNode && isLabelElement(parentNode)) return parentNode;
  if (!control.id) return;
  const labelElement = document.querySelector(
    `label[for=${control.id}]`
  ) as HTMLLabelElement;
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
  function mutationCallback(mutationList: MutationRecord[]) {
    for (const mutation of mutationList) {
      if (mutation.type !== 'attributes') continue;
      if (mutation.attributeName !== 'data-felte-validation-message') continue;
      const target: any = mutation.target;
      const elPath = getPath(target);
      const validationMessage: string = setContent
        ? setContent(target.dataset.felteValidationMessage?.split('\n'), elPath)
        : target.dataset.felteValidationMessage;
      const tippyInstance: Instance<Props> = target?._tippy;
      if (!tippyInstance) continue;
      if (validationMessage) {
        target.setAttribute('aria-invalid', 'true');
        tippyInstance.setContent(validationMessage);
        !tippyInstance.state.isEnabled && tippyInstance.enable();
        if (document.activeElement === target && !tippyInstance.state.isShown) {
          tippyInstance.show();
        }
      } else {
        target.removeAttribute('aria-invalid');
        tippyInstance.disable();
      }
    }
  }

  return function reporter<Data extends Obj = Obj>(
    currentForm: CurrentForm<Data>
  ): ReporterHandler<Data> {
    const { controls, form } = currentForm;
    if (!controls || !form) return {};
    const tippyInstances = controls
      .map((control) => {
        const content = control.dataset.felteValidationMessage;
        const triggerTarget = [control, getControlLabel(control)].filter(
          Boolean
        ) as HTMLElement[];
        if (control.hasAttribute('data-felte-reporter-tippy-ignore')) return;
        const elPath = getPath(control);
        const tippyFieldProps = _get(
          tippyPropsMap,
          elPath,
          {}
        ) as TippyFieldProps;
        const instance = tippy(control, {
          trigger: 'mouseenter click focusin',
          content: setContent
            ? setContent(content?.split('\n'), elPath)
            : content,
          triggerTarget,
          ...tippyProps,
          ...tippyFieldProps,
        });
        instance.popper.setAttribute('aria-live', 'polite');
        if (!content) instance.disable();
        return instance;
      })
      .filter(Boolean) as Instance<Props>[];
    const mutationObserver = new MutationObserver(mutationCallback);
    mutationObserver.observe(form, mutationConfig);
    return {
      destroy() {
        mutationObserver.disconnect();
        tippyInstances.forEach((instance) => instance.destroy());
      },
      onSubmitError() {
        const firstInvalidElement = form.querySelector(
          '[data-felte-validation-message]'
        ) as FormControl;
        firstInvalidElement.focus();
        const tippyInstance: Instance<Props> = (firstInvalidElement as any)
          ?._tippy;
        if (!tippyInstance || tippyInstance.state.isShown) return;
        tippyInstance.setContent(
          firstInvalidElement.dataset.felteValidationMessage || ''
        );
        if (!tippyInstance.state.isEnabled) tippyInstance.enable();
        tippyInstance.show();
      },
    };
  };
}

export default tippyReporter;
