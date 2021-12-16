import type { Errors, Obj } from '@felte/common';
import type { JSX } from 'solid-js';
import { _get, getPath } from '@felte/common';
import { onMount, createSignal, Show, createEffect, onCleanup } from 'solid-js';
import { errorStores } from './stores';
import { createId } from './utils';

export type ValidationMessageProps = {
  for: string;
  index?: string | number;
  children: (messages: string | string[] | undefined) => JSX.Element;
};

export function ValidationMessage<Data extends Obj = Obj>(
  props: ValidationMessageProps
) {
  const [errorPath, setErrorPath] = createSignal<string>();
  const [errors, setErrors] = createSignal<Errors<Data>>({});
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
    const path =
      typeof props.index !== 'undefined'
        ? `${props.for}[${props.index}]`
        : props.for;
    setErrorPath(getPath(element, path));
    const formElement = getFormElement(element) as HTMLFormElement;
    const reporterId = formElement?.dataset.felteReporterSvelteId;
    if (!reporterId) return;
    const store = errorStores[reporterId];
    unsubscribe = store?.subscribe(($errors: Errors<Data>) =>
      setErrors(() => $errors)
    );
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
