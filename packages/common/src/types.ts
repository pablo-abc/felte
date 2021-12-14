import type { Readable, Writable } from 'svelte/store';

export type DeepSetResult<Data extends Obj | Obj[], Value> = {
  [key in keyof Data]: Data[key] extends Obj
    ? DeepSetResult<Data[key], Value>
    : Data[key] extends Obj[]
    ? DeepSetResult<Data[key], Value>[]
    : Value;
};

export type CreateSubmitHandlerConfig<Data extends Obj> = {
  onSubmit?: FormConfig<Data>['onSubmit'];
  validate?: FormConfig<Data>['validate'];
  onError?: FormConfig<Data>['onError'];
};

export type Helpers<Data extends Obj> = {
  /** Function that resets the form to its initial values */
  reset: () => void;
  /** Helper function to touch a specific field. */
  setTouched: (path: string) => void;
  /** Helper function to set an error to a specific field. */
  setError: (path: string, error: string | string[]) => void;
  /** Helper function to set the value of a specific field. Set `touch` to `false` if you want to set the value without setting the field to touched. */
  setField: (path: string, value?: FieldValue, touch?: boolean) => void;
  /** Helper function to get the value of a specific field. */
  getField(path: string): FieldValue | FieldValue[];
  /** Helper function to set all values of the form. Useful for "initializing" values after the form has loaded. */
  setFields: (values: Data) => void;
  /** Helper function that validates every fields and touches all of them. It updates the `errors` store. */
  validate: () => Promise<Errors<Data> | void>;
  /** Helper function to re-set the initialValues of Felte. No reactivity will be triggered but this will be the data the form will be reset to when caling `reset`. */
  setInitialValues: (values: Data) => void;
};

export type CurrentForm<Data extends Obj> = {
  form?: HTMLFormElement;
  controls?: FormControl[];
  errors: Writable<Errors<Data>>;
  data: Writable<Data>;
  touched: Writable<Touched<Data>>;
  config: FormConfig<Data>;
  setFields(values: Data): void;
  reset(): void;
  validate(): Promise<Errors<Data> | void>;
  addValidator(validator: ValidationFunction<Data>): void;
  addTransformer(transformer: TransformFunction<Data>): void;
};

export type OnSubmitErrorState<Data extends Obj> = {
  data: Data;
  errors: Errors<Data>;
};

export type ExtenderHandler<Data extends Obj> = {
  destroy?: () => void;
  onSubmitError?: (state: OnSubmitErrorState<Data>) => void;
};

export type Extender<Data extends Obj = Obj> = (
  currentForm: CurrentForm<Data>
) => ExtenderHandler<Data>;

/** `Record<string, unknown>` */
export type Obj = Record<string, unknown>;

/** Possible field values. */
export type FieldValue =
  | string
  | string[]
  | boolean
  | number
  | File
  | File[]
  | undefined;

export type FormControl =
  | HTMLInputElement
  | HTMLTextAreaElement
  | HTMLSelectElement;

export type ValidationFunction<Data extends Obj> = (
  values: Data
) => Errors<Data> | undefined | Promise<Errors<Data> | undefined>;

export type TransformFunction<Data extends Obj> = (values: Obj) => Data;

export type SubmitContext<Data extends Obj> = {
  form?: HTMLFormElement;
  controls?: FormControl[];
  config: FormConfig<Data>;
};

/**
 * Configuration object when `initialValues` is not set. Used when using the `form` action.
 */
export interface FormConfigWithoutInitialValues<Data extends Obj> {
  /** Optional function to validate the data. */
  validate?: ValidationFunction<Data> | ValidationFunction<Data>[];
  /** Optional function to transform data before it gets set in the store. */
  transform?: TransformFunction<Data> | TransformFunction<Data>[];
  /** Required function to handle the form data on submit. */
  onSubmit: (
    values: Data,
    context: SubmitContext<Data>
  ) => Promise<void> | void;
  /** Optional function that accepts any thrown exceptions from the onSubmit function. You can return an object with the same shape [[`Errors`]] for a reporter to use it. */
  onError?: (errors: unknown) => void | Errors<Data>;
  /** Optional function/s to extend Felte's functionality. */
  extend?: Extender<Data> | Extender<Data>[];
  /** Optional array that sets which events should trigger a field to be touched. */
  touchTriggerEvents?: {
    change?: boolean;
    input?: boolean;
    blur?: boolean;
  };
  [key: string]: unknown;
}

/**
 * Configuration object when `initialValues` is set. Used when using the `data` store to bind to form inputs.
 */
export interface FormConfigWithInitialValues<Data extends Obj>
  extends FormConfigWithoutInitialValues<Data> {
  /** Initial values for the form. To be used when not using the `form` action. */
  initialValues: Data;
  [key: string]: unknown;
}

/**
 * Configuration object type. `initialValues` is optional.
 */
export interface FormConfig<Data extends Obj>
  extends FormConfigWithoutInitialValues<Data> {
  initialValues?: Data;
  [key: string]: unknown;
}

/** The errors object may contain either a string or array or string per key. */
export type Errors<Data extends Obj | Obj[]> = {
  [key in keyof Data]?: Data[key] extends Obj
    ? Errors<Data[key]>
    : Data[key] extends Obj[]
    ? Errors<Data[key]>[]
    : string | string[] | null;
};

/** The touched object may only contain booleans per key. */
export type Touched<Data extends Obj | Obj[]> = {
  [key in keyof Data]: Data[key] extends Obj
    ? Touched<Data[key]>
    : Data[key] extends Obj[]
    ? Touched<Data[key]>[]
    : boolean | boolean[];
};

export type FormAction = (node: HTMLFormElement) => { destroy: () => void };

/** The stores that `createForm` creates. */
export type Stores<Data extends Obj> = {
  /** Writable store that contains the form's data. */
  data: Writable<Data>;
  /** Writable store that contains the form's validation errors. */
  errors: Writable<Errors<Data>>;
  /** Writable store that denotes if any field has been touched. */
  touched: Writable<Touched<Data>>;
  /** Writable store containing only a boolean that represents if the form is submitting. */
  isSubmitting: Writable<boolean>;
  /** Readable store containing only a boolean that represents if the form is valid. */
  isValid: Readable<boolean>;
  /** Readable store containing only a boolean that represents if the form is dirty. */
  isDirty: Writable<boolean>;
};

/** The return type for the `createForm` function. */
export type Form<Data extends Obj> = {
  /** Action function to be used with the `use` directive on your `form` elements. */
  form: FormAction;
  /** Function to handle submit to be passed to the on:submit event. Not necessary if using the `form` action. */
  handleSubmit: (e?: Event) => void;
  /** Function that creates a submit handler. If a function is passed as first argument it overrides the default `onSubmit` function set in the `createForm` config object. */
  createSubmitHandler: (
    altConfig?: CreateSubmitHandlerConfig<Data>
  ) => (e?: Event) => void;
} & Stores<Data> &
  Helpers<Data>;
