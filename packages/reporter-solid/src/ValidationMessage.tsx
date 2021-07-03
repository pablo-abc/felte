import type { Errors, Obj } from '@felte/common';
import type { JSX } from 'solid-js';
import { _get, isFieldSetElement, getIndex } from '@felte/common';
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

  function getPath() {
    let path = props.for;
    path = typeof props.index === 'undefined' ? path : `${path}[${props.index}]`;
    let parent = element?.parentNode;
    if (!parent) return path;
    while (parent && parent.nodeName !== 'FORM') {
      if (isFieldSetElement(parent) && parent.name) {
        const index = getIndex(parent);
        const fieldsetName =
              typeof index === 'undefined' ? parent.name : `${parent.name}[${index}]`;
        path = `${fieldsetName}.${path}`;
      }
      parent = parent.parentNode;
    }
    return path;
  }
  let unsubscribe: (() => void) | undefined;
  onMount(() => {
    setErrorPath(getPath());
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
