import type { Errors, Obj, RecursivePartial } from '@felte/common';
import type { ReactNode } from 'react';
import React, { useState, useEffect, useMemo } from 'react';
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
  const id = useMemo(() => createId(21), []);
  function getFormElement(element: HTMLDivElement) {
    return element.closest('form');
  }

  useEffect(() => {
    let unsubscriber;
    // To guarantee the DOM has rendered we need to setTimeout
    setTimeout(() => {
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
        unsubscriber = errors.subscribe(($errors: Partial<Errors<Data>>) => {
          setMessages(_get($errors, errorPath) as any);
        });
      } else {
        const warnings = warningStores[reporterId];
        unsubscriber = warnings.subscribe(
          ($warnings: Partial<Errors<Data>>) => {
            setMessages(_get($warnings, errorPath) as any);
          }
        );
      }
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
