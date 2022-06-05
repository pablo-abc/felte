import type { Field, FieldConfig } from '@felte/core';
export type { FieldConfig, Field } from '@felte/core';
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
  return coreCreateField(nameOrConfig, config);
}
