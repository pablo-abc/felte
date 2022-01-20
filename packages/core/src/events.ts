import type { SubmitContext, Obj } from '@felte/common';

export type FelteSuccessDetail<Data extends Obj = Obj> = SubmitContext<Data> & {
  response: unknown;
};

export type FelteErrorDetail<Data extends Obj = Obj> = SubmitContext<Data> & {
  error: unknown;
};

export type FelteSuccessEvent<Data extends Obj = Obj> = CustomEvent<
  FelteSuccessDetail<Data>
>;

export type FelteErrorEvent<Data extends Obj = Obj> = CustomEvent<
  FelteErrorDetail<Data>
>;
