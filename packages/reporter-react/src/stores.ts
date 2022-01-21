import type { Errors, PartialWritable } from '@felte/common';

export type ErrorStores = {
  [index: string]: PartialWritable<Errors<Record<string, any>>>;
};

export const errorStores: ErrorStores = {};
export const warningStores: ErrorStores = {};
