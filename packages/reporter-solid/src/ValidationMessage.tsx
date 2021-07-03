import type { Errors, Obj } from '@felte/common';
import type { JSX } from 'solid-js';
import { _get, isFieldSetElement, getPath } from '@felte/common';
import { onMount, createSignal, Show, createEffect, onCleanup } from 'solid-js';
import { errorStores } from './stores';

export type ValidationMessageProps = {
  for: string;
  index?: string | number;
  children: (messages: string | string[] | undefined) => JSX.Element;
}

export function ValidationMessage<Data extends Obj = Obj>(props: ValidationMessageProps) {
  const [errorPath, setErrorPath] = createSignal<string>();
  const [errors, setErrors] = createSignal({});
  const [messages, setMessages] = createSignal<string | string[]>();
  let element: HTMLDivElement | undefined = undefined;
  function getFormElement() {
    let form = element?.parentNode;
    if (!form) return;
    while (form && form.nodeName !== 'FORM') {
      form = form.parentNode;
    }
    return form;
  }

  let unsubscribe: (() => void) | undefined;
  onMount(() => {
    const path = props.index ? `${props.for}[${props.index}]` : props.for;
    if (!element) return;
    setErrorPath(getPath(element, path));
    const formElement = getFormElement() as HTMLFormElement;
    const reporterId = formElement?.dataset.felteReporterSvelteId;
    if (!reporterId) return;
    const store = errorStores[reporterId];
    unsubscribe = store?.subscribe(($errors: Errors<Data>) => setErrors($errors));
  });

  onCleanup(() => unsubscribe?.());

  createEffect(() => {
    const path = errorPath()
    if (path) setMessages(_get(errors(), path) as any);
  });
  return (
    <>
      <div ref={element} style="display: none;" />
      <Show when={errorPath()}>
        {props.children(messages())}
      </Show>
    </>
  );
}
