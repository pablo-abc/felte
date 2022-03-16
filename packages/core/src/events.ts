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

export type FelteSuccessEvent<Data extends Obj = any> = CustomEvent<
  FelteSuccessDetail<Data>
>;

export type FelteErrorEvent<Data extends Obj = any> = CustomEvent<
  FelteErrorDetail<Data>
> & {
  errors?: AssignableErrors<Data>;

  setErrors(errors: AssignableErrors<Data>): void;
};

export type FelteSubmitEvent<Data extends Obj = any> = Event & {
  target: HTMLFormElement;
  onSubmit?: CreateSubmitHandlerConfig<Data>['onSubmit'];
  onError?: CreateSubmitHandlerConfig<Data>['onError'];
  onSuccess?: CreateSubmitHandlerConfig<Data>['onSuccess'];

  handleSubmit(onSubmit: CreateSubmitHandlerConfig<Data>['onSubmit']): void;

  handleError(onError: CreateSubmitHandlerConfig<Data>['onError']): void;

  handleSuccess(onSuccess: CreateSubmitHandlerConfig<Data>['onSuccess']): void;
};

export function createEventConstructors<Data extends Obj = any>() {
  class SuccessEvent<Data extends Obj = any> extends CustomEvent<
    FelteSuccessDetail<Data>
  > {
    constructor(detail: FelteSuccessDetail<Data>) {
      super('feltesuccess', { detail });
    }
  }

  class ErrorEvent<Data extends Obj = any> extends CustomEvent<
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

  class SubmitEvent<Data extends Obj = any> extends CustomEvent<undefined> {
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

  return {
    createErrorEvent: (detail: FelteErrorDetail<Data>) =>
      new ErrorEvent<Data>(detail) as FelteErrorEvent<Data>,
    createSubmitEvent: () => new SubmitEvent<Data>() as FelteSubmitEvent<Data>,
    createSuccessEvent: (detail: FelteSuccessDetail<Data>) =>
      new SuccessEvent<Data>(detail) as FelteSuccessEvent<Data>,
  };
}
