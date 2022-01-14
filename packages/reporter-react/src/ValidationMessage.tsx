import type { Errors, Obj } from '@felte/common';
import type { ReactNode } from 'react';
import React, { useState, useEffect } from 'react';
import { _get, getPath } from '@felte/common';
import { errorStores, warningStores } from './stores';
import { createId } from './utils';

export type ValidationMessageProps = {
  for: string;
  index?: string | number;
  level?: 'error' | 'warning';
  children: (messages: string | string[] | undefined) => ReactNode;
};

export function ValidationMessage<Data extends Obj = Obj>(
  props: ValidationMessageProps
) {
  const level = props.level ?? 'error';
  const [messages, setMessages] = useState<string | string[]>();
  function getFormElement(element: HTMLDivElement) {
    return element.closest('form');
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
    if (level === 'error') {
      const errors = errorStores[reporterId];
      return errors.subscribe(($errors: Errors<Data>) => {
        setMessages(_get($errors, errorPath) as any);
      });
    } else {
      const warnings = warningStores[reporterId];
      return warnings.subscribe(($warnings: Errors<Data>) => {
        setMessages(_get($warnings, errorPath) as any);
      });
    }
  }, []);

  return (
    <>
      <div id={id} style={{ display: 'none' }} />
      {props.children(messages)}
    </>
  );
}
