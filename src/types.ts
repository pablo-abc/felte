import type { Writable, Readable } from 'svelte/store';

export type FormConfigWithoutInitialValues<
  D extends Record<string, unknown>
> = {
  validate?: (values: D) => Errors<D> | Promise<Errors<D>>;
  onSubmit: (values: D) => Promise<void> | void;
  onError?: (errors: unknown) => void;
  useConstraintApi?: boolean;
};

export type FormConfigWithInitialValues<D extends Record<string, unknown>> = {
  initialValues: D;
} & FormConfigWithoutInitialValues<D>;

export type FormConfig<D extends Record<string, unknown>> = {
  initialValues?: D;
} & FormConfigWithoutInitialValues<D>;

export declare type Errors<Values> = {
  [key in keyof Values]?: string;
};

export type Touched<D extends Record<string, unknown>> = {
  [key in keyof D]: boolean;
};

export type FormAction = (node: HTMLFormElement) => { destroy: () => void };

export interface Form<D extends Record<string, unknown>> {
  form: FormAction;
  data: Writable<D>;
  errors: Readable<Errors<D>>;
  touched: Writable<Touched<D>>;
  handleSubmit: (e: Event) => void;
  isValid: Readable<boolean>;
  isSubmitting: Writable<boolean>;
}
