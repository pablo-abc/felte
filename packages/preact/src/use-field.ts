import type { Field as CoreField, FieldConfig } from '@felte/core';
export type { FieldConfig } from '@felte/core';
import type { Ref } from 'preact';
import { createField as coreCreateField } from '@felte/core';
import { useRef, useEffect } from 'preact/hooks';
import { useConst } from './use-const';

export type Field = Omit<CoreField, 'field'> & {
  field: Ref<any>;
};

export function useField(
  name: string,
  config?: Omit<FieldConfig, 'name'>
): Field;
export function useField(config: FieldConfig): Field;
export function useField(
  nameOrConfig: FieldConfig | string,
  config?: Omit<FieldConfig, 'name'>
): Field {
  const fieldRef = useRef<HTMLElement>(null);

  const { field, ...rest } = useConst(() => {
    const { field: coreField, ...rest } = coreCreateField(nameOrConfig, config);

    function field(node?: HTMLElement | null) {
      if (!node) return;
      const { destroy } = coreField(node);
      return () => destroy?.();
    }

    return { field, ...rest };
  });

  useEffect(() => {
    return field(fieldRef.current);
  }, []);

  return {
    field: fieldRef,
    ...rest,
  };
}
