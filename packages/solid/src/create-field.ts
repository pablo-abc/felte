import type { Field, FieldConfig } from '@felte/core';
import { onCleanup } from 'solid-js';
import { createField as coreCreateField } from '@felte/core';

export function createField(
  name: string,
  config?: Omit<FieldConfig, 'name'>
): Field;
export function createField(config: FieldConfig): Field;
export function createField(
  nameOrConfig: FieldConfig | string,
  config?: Omit<FieldConfig, 'name'>
): Field {
  const { field: coreField, onChange, onInput, onBlur } = coreCreateField(
    nameOrConfig,
    config
  );

  function field(node: HTMLElement) {
    const { destroy } = coreField(node);
    /* istanbul ignore next */
    onCleanup(() => destroy?.());
    return { destroy };
  }

  return {
    field,
    onChange,
    onInput,
    onBlur,
  };
}
