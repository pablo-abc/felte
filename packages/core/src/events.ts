import type { SubmitContext, Obj } from '@felte/common';

export type FelteSuccessDetail<Data extends Obj = Obj> = SubmitContext<Data> & {
  response: unknown;
};

export type FelteErrorDetail<Data extends Obj = Obj> = SubmitContext<Data> & {
  error: unknown;
};

export class FelteSuccessEvent<Data extends Obj = Obj> extends CustomEvent<
  FelteSuccessDetail<Data>
> {
  constructor(detail: FelteSuccessDetail<Data>) {
    super('feltesuccess', { detail });
  }
}

export class FelteErrorEvent<Data extends Obj = Obj> extends CustomEvent<
  FelteErrorDetail<Data>
> {
  constructor(detail: FelteErrorDetail<Data>) {
    super('felteerror', { detail });
  }
}
