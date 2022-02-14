import type { ReactNode } from 'react';
import React, { useState, useEffect, useMemo } from 'react';
import { _get, getPath, createId } from '@felte/common';
import { errorStores, warningStores } from './stores';

export type ValidationMessageProps = {
  for: string;
  level?: 'error' | 'warning';
  children: (messages: string[] | null) => ReactNode;
};

export function ValidationMessage(props: ValidationMessageProps) {
  const level = props.level ?? 'error';
  const [messages, setMessages] = useState<string[] | null>(null);
  const id = useMemo(() => createId(21), []);
  function getFormElement(element: HTMLDivElement) {
    return element.closest('form');
  }

  useEffect(() => {
    let unsubscriber;
    // To guarantee the DOM has rendered we need to setTimeout
    setTimeout(() => {
      const element = document.getElementById(id) as HTMLDivElement;
      const path = props.for;
      const errorPath = getPath(element, path);
      const formElement = getFormElement(element) as HTMLFormElement;
      const reporterId = formElement?.dataset.felteReporterReactId;
      if (!reporterId) return;
      if (level === 'error') {
        const errors = errorStores[reporterId];
        unsubscriber = errors.subscribe(($errors) => {
          setMessages(_get($errors, errorPath) as any);
        });
      } else {
        const warnings = warningStores[reporterId];
        unsubscriber = warnings.subscribe(($warnings) => {
          setMessages(_get($warnings, errorPath) as any);
        });
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
