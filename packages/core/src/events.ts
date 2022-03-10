import type {
  SubmitContext,
  Obj,
  CreateSubmitHandlerConfig,
  AssignableErrors,
} from '@felte/common';

export type FelteSuccessDetail<Data extends Obj = Obj> = SubmitContext<Data> & {
  response: unknown;
};

export type FelteErrorDetail<Data extends Obj = Obj> = SubmitContext<Data> & {
  error: unknown;
};

export class FelteCustomEvent<Detail = unknown> extends Event {
  constructor(
    name: string,
    { detail, ...init }: EventInit & { detail: Detail }
  ) {
    super(name, init);
    this._detail = detail;
  }
  private _detail: Detail;
  get detail() {
    return this._detail;
  }
}

export class FelteSuccessEvent<Data extends Obj = any> extends FelteCustomEvent<
  FelteSuccessDetail<Data>
> {
  constructor(detail: FelteSuccessDetail<Data>) {
    super('feltesuccess', { detail });
  }
}

export class FelteErrorEvent<Data extends Obj = any> extends FelteCustomEvent<
  FelteErrorDetail<Data>
> {
  constructor(detail: FelteErrorDetail<Data>) {
    super('felteerror', { detail, cancelable: true });
  }

  errors?: AssignableErrors<Data>;

  setErrors(errors: AssignableErrors<Data>) {
    this.preventDefault();
    this.errors = errors;
  }
}

export class FelteSubmitEvent<Data extends Obj = any> extends Event {
  constructor() {
    super('feltesubmit', { cancelable: true });
  }

  target!: HTMLFormElement;

  onSubmit?: CreateSubmitHandlerConfig<Data>['onSubmit'];
  onError?: CreateSubmitHandlerConfig<Data>['onError'];
  onSuccess?: CreateSubmitHandlerConfig<Data>['onSuccess'];

  handleSubmit(onSubmit: CreateSubmitHandlerConfig<Data>['onSubmit']) {
    this.onSubmit = onSubmit;
  }

  handleError(onError: CreateSubmitHandlerConfig<Data>['onError']) {
    this.onError = onError;
  }

  handleSuccess(onSuccess: CreateSubmitHandlerConfig<Data>['onSuccess']) {
    this.onSuccess = onSuccess;
  }
}
