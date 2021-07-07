import type { FieldValue } from '@felte/common';

export type DispatchEvent = CustomEvent<{
  value: FieldValue;
  path: string;
}>;
