import type { Errors, Obj } from '@felte/common';
import type { ReactNode } from 'react';
import React, { useState, useEffect } from 'react';
import { _get, getPath } from '@felte/common';
import { errorStores } from './stores';
import { createId } from './utils';

export type ValidationMessageProps = {
  for: string;
  index?: string | number;
  children: (messages: string | string[] | undefined) => ReactNode;
};

export function ValidationMessage<Data extends Obj = Obj>(
  props: ValidationMessageProps
) {
  const [messages, setMessages] = useState<string | string[]>();
  function getFormElement(element: HTMLDivElement) {
    let form = element.parentNode;
    if (!form) return;
    while (form && form.nodeName !== 'FORM') {
      form = form.parentNode;
    }
    return form;
  }

  const id = createId(21);
  useEffect(() => {
    const element = document.getElementById(id) as HTMLDivElement;
    const path =
      typeof props.index !== 'undefined'
        ? `${props.for}[${props.index}]`
        : props.for;
    const errorPath = getPath(element, path);
    const formElement = getFormElement(element) as HTMLFormElement;
    const reporterId = formElement?.dataset.felteReporterReactId;
    if (!reporterId) return;
    const store = errorStores[reporterId];
    const unsubscriber = store?.subscribe(($errors: Errors<Data>) => {
      setMessages(_get($errors, errorPath) as any);
    });
    return unsubscriber;
  }, []);

  return (
    <>
      <div id={id} style={{ display: 'none' }} />
      {props.children(messages)}
    </>
  );
}
