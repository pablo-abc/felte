import type { Field as CoreField, FieldConfig } from '@felte/core';
import { onCleanup } from 'solid-js';
import { createField as coreCreateField } from '@felte/core';

export type Field = CoreField & {
  onInput: CoreField['onChange'];
};

export function createField(
  name: string,
  config?: Omit<FieldConfig, 'name'>
): Field;
export function createField(config: FieldConfig): Field;
export function createField(
  nameOrConfig: FieldConfig | string,
  config?: Omit<FieldConfig, 'name'>
): Field {
  const { field: coreField, onChange, onBlur } = coreCreateField(
    nameOrConfig,
    config
  );

  function field(node: HTMLElement) {
    const { destroy } = coreField(node);
    onCleanup(() => destroy?.());
    return { destroy };
  }

  return {
    field,
    onChange,
    onInput: onChange,
    onBlur,
  };
}
