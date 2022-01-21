import type { Errors, Obj } from '@felte/common';
import type { JSX } from 'solid-js';
import { _get, getPath } from '@felte/common';
import {
  onMount,
  createSignal,
  Show,
  createEffect,
  onCleanup,
  mergeProps,
} from 'solid-js';
import { errorStores, warningStores } from './stores';
import { createId } from './utils';

export type ValidationMessageProps = {
  for: string;
  index?: string | number;
  level?: 'error' | 'warning';
  children: (messages: string | string[] | undefined) => JSX.Element;
};

export function ValidationMessage<Data extends Obj = Obj>(
  props: ValidationMessageProps
) {
  props = mergeProps({ level: 'error' }, props);
  const [errorPath, setErrorPath] = createSignal<string>();
  const [errors, setErrors] = createSignal<Errors<Data> | Record<string, any>>(
    {}
  );
  const [messages, setMessages] = createSignal<string | string[]>();
  function getFormElement(element: HTMLDivElement) {
    return element.closest('form');
  }

  const id = createId(21);
  let unsubscribe: (() => void) | undefined;
  onMount(() => {
    const element = document.getElementById(id) as HTMLDivElement;
    const path =
      typeof props.index !== 'undefined'
        ? `${props.for}[${props.index}]`
        : props.for;
    setErrorPath(getPath(element, path));
    const formElement = getFormElement(element) as HTMLFormElement;
    const reporterId = formElement?.dataset.felteReporterSolidId;
    if (!reporterId) return;
    if (props.level === 'error') {
      const errors = errorStores[reporterId];
      unsubscribe = errors.subscribe(($errors) => setErrors(() => $errors));
    } else {
      const warnings = warningStores[reporterId];
      unsubscribe = warnings.subscribe(($warnings) =>
        setErrors(() => $warnings)
      );
    }
  });

  onCleanup(() => unsubscribe?.());

  createEffect(() => {
    const path = errorPath();
    if (path) setMessages(_get(errors(), path) as any);
  });

  return (
    <>
      <div id={id} style="display: none;" />
      <Show when={errorPath()}>{props.children(messages())}</Show>
    </>
  );
}
