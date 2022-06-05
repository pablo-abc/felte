import { CurrentForm, Obj, ExtenderHandler, Extender } from '@felte/common';

export type ReporterOptions = {
  preventFocusOnError?: boolean;
};

export function reporter<Data extends Obj = any>(
  options?: ReporterOptions
): Extender<Data>;
export function reporter<Data extends Obj = any>(
  currentForm: CurrentForm<Data>
): ExtenderHandler<Data>;
export function reporter<Data extends Obj = any>(
  currentFormOrOptions?: CurrentForm<Data> | ReporterOptions
): ExtenderHandler<Data> | Extender<Data>;
