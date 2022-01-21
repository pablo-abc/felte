import type { Writable } from 'svelte/store';
import type { Errors } from '@felte/common';

export type ErrorStores = {
  [index: string]: Writable<Partial<Errors<any>>>;
};

export const errorStores: ErrorStores = {};
export const warningStores: ErrorStores = {};
