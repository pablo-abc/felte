import type { PartialWritableErrors } from '@felte/common';

export type ErrorStores = {
  [index: string]: PartialWritableErrors<any>;
};

export const errorStores: ErrorStores = {};
export const warningStores: ErrorStores = {};
