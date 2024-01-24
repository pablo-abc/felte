import type { JSX, Component } from 'solid-js';
import { _get } from '@felte/common';
import {
  onMount,
  createSignal,
  onCleanup,
  mergeProps,
  splitProps,
  Show,
} from 'solid-js';
import { Dynamic } from 'solid-js/web';
import { errorStores, warningStores } from './stores';

export type ValidationMessageProps = {
  [key: string]: any;
  for: string;
  level?: 'error' | 'warning';
  children: (messages: string[] | null) => JSX.Element;
  as?: Component<any> | string | keyof JSX.IntrinsicElements;
};

export function ValidationMessage(props: ValidationMessageProps) {
  props = mergeProps({ level: 'error' as const }, props);
  const [, others] = splitProps(props, ['for', 'level', 'children', 'as']);
  const [messages, setMessages] = createSignal<null | string[]>(null);
  function getFormElement(element: HTMLDivElement) {
    return element.closest('form');
  }

  let errorContainer: HTMLDivElement | undefined;
  let unsubscribe: (() => void) | undefined;
  onMount(() => {
    const element = errorContainer as HTMLDivElement;
    const path = props.for;
    const formElement = getFormElement(element);
    const reporterId = formElement?.dataset.felteReporterSolidId;
    if (!reporterId) return;
    if (props.level === 'error') {
      const errors = errorStores[reporterId];
      unsubscribe = errors.subscribe(($errors) =>
        setMessages(_get($errors, path) as string[] | null),
      );
    } else {
      const warnings = warningStores[reporterId];
      unsubscribe = warnings.subscribe(($warnings) =>
        setMessages(_get($warnings, path) as string[] | null),
      );
    }
  });

  onCleanup(() => unsubscribe?.());

  return (
    <Show
      when={props.as}
      fallback={
        <>
          <div ref={errorContainer} style="display: none;" />
          {props.children(messages())}
        </>
      }
    >
      <Dynamic component={props.as} {...others} ref={errorContainer}>
        {props.children(messages())}
      </Dynamic>
    </Show>
  );
}
