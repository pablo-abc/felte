import type { FieldValue } from '../types';

/** @category Helper */
export function isFieldValue(value: unknown): value is FieldValue {
  if (Array.isArray(value)) {
    if (value.length === 0) return true;
    return value.some((v) => v instanceof File || typeof v === 'string');
  }
  return (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    value instanceof File
  );
}
