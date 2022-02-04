import type { JSX } from 'solid-js';
import { _get, createId } from '@felte/common';
import { onMount, createSignal, onCleanup, mergeProps } from 'solid-js';
import { errorStores, warningStores } from './stores';

export type ValidationMessageProps = {
  for: string;
  level?: 'error' | 'warning';
  children: (messages: string[] | null) => JSX.Element;
};

export function ValidationMessage(props: ValidationMessageProps) {
  props = mergeProps({ level: 'error' }, props);
  const [messages, setMessages] = createSignal<null | string[]>(null);
  function getFormElement(element: HTMLDivElement) {
    return element.closest('form');
  }

  const id = createId(21);
  let unsubscribe: (() => void) | undefined;
  onMount(() => {
    const element = document.getElementById(id) as HTMLDivElement;
    const path = props.for;
    const formElement = getFormElement(element) as HTMLFormElement;
    const reporterId = formElement?.dataset.felteReporterSolidId;
    if (!reporterId) return;
    if (props.level === 'error') {
      const errors = errorStores[reporterId];
      unsubscribe = errors.subscribe(($errors) =>
        setMessages(_get($errors, path) as string[] | null)
      );
    } else {
      const warnings = warningStores[reporterId];
      unsubscribe = warnings.subscribe(($warnings) =>
        setMessages(_get($warnings, path) as string[] | null)
      );
    }
  });

  onCleanup(() => unsubscribe?.());

  return (
    <>
      <div id={id} style="display: none;" />
      {props.children(messages())}
    </>
  );
}
