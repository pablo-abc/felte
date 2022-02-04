import type { JSX } from 'solid-js';
import { _get, getPath } from '@felte/common';
import { onMount, createSignal, onCleanup } from 'solid-js';
import { errorStores } from './stores';
import { createId } from './utils';

export type ValidationMessageProps = {
  for: string;
  index?: string | number;
  children: (messages: string | string[] | undefined) => JSX.Element;
};

export function ValidationMessage(props: ValidationMessageProps) {
  const [messages, setMessages] = createSignal<string | string[]>();
  function getFormElement(element: HTMLDivElement) {
    let form = element.parentNode;
    if (!form) return;
    while (form && form.nodeName !== 'FORM') {
      form = form.parentNode;
    }
    return form;
  }

  const id = createId(21);
  let unsubscribe: (() => void) | undefined;
  onMount(() => {
    const element = document.getElementById(id) as HTMLDivElement;
    const path = getPath(
      element,
      typeof props.index !== 'undefined'
        ? `${props.for}[${props.index}]`
        : props.for
    );
    const formElement = getFormElement(element) as HTMLFormElement;
    const reporterId = formElement?.dataset.felteReporterSvelteId;
    if (!reporterId) return;
    const store = errorStores[reporterId];
    unsubscribe = store?.subscribe(($errors: any) =>
      setMessages(_get($errors, path) as any)
    );
  });

  onCleanup(() => unsubscribe?.());

  return (
    <>
      <div id={id} style="display: none;" />
      {props.children(messages())}
    </>
  );
}
