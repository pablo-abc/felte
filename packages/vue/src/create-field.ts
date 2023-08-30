import type { Field as CoreField, FieldConfig } from '@felte/core';
export type { FieldConfig } from '@felte/core';
import { createField as coreCreateField } from '@felte/core';

export type Field = Omit<CoreField, 'field'> & {
  vField: {
    mounted: (el: HTMLElement) => void;
    unmounted: (el: HTMLElement) => void;
  };
};

const cleanups = new WeakMap<HTMLElement, () => void>();

export function createField(
  name: string,
  config?: Omit<FieldConfig, 'name'>
): Field;
export function createField(config: FieldConfig): Field;
export function createField(
  nameOrConfig: FieldConfig | string,
  config?: Omit<FieldConfig, 'name'>
): Field {
  const { field: coreField, ...rest } = coreCreateField(nameOrConfig, config);

  const vField = {
    mounted: (el: HTMLElement) => {
      const { destroy } = coreField(el);
      cleanups.set(el, () => destroy?.());
    },
    unmounted: (el: HTMLElement) => {
      const cleanup = cleanups.get(el);
      if (cleanup) cleanup();
    },
  };
  return { ...rest, vField };
}
