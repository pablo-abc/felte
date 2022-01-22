import type { Obj, FormConfig, ValidationFunction } from '@felte/common';

export function getAllValidators<Data extends Obj>(
  prop: 'warn' | 'validate',
  config: FormConfig<Data>
): ValidationFunction<Data>[] {
  const validate = config[prop] ?? [];
  const validations = Array.isArray(validate) ? validate : [validate];
  const debounced = config.debounced?.[prop] ?? [];
  const debValidations = Array.isArray(debounced) ? debounced : [debounced];
  return [...validations, ...debValidations];
}
