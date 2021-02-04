import type { Writable, Readable } from 'svelte/store';

type Obj = Record<string, unknown>;

/**
 * Configuration object when `initialValues` is not set. Used when using the `form` action.
 */
export interface FormConfigWithoutInitialValues<Data extends Obj> {
  /** Optional function to validate the data. */
  validate?: (values: Data) => Errors<Data> | Promise<Errors<Data>>;
  /** Required function to handle the form data on submit. */
  onSubmit: (values: Data) => Promise<void> | void;
  /** Optional function that accepts any thrown exceptions from the onSubmit function. */
  onError?: (errors: unknown) => void;
  /** Optional boolean that tells Felte to use the Constraint Validation API to report validation errors. */
  useConstraintApi?: boolean;
}

/**
 * Configuration object when `initialValues` is set. Used when using the `data` store to bind to form inputs.
 */
export interface FormConfigWithInitialValues<Data extends Obj>
  extends FormConfigWithoutInitialValues<Data> {
  /** Initial values for the form. To be used when not using the `form` action. */
  initialValues: Data;
}

/**
 * Configuration object type. `initialValues` is optional.
 */
export interface FormConfig<Data extends Obj>
  extends FormConfigWithoutInitialValues<Data> {
  initialValues?: Data;
}

/** The errors object may contain either a string or array or string per key. */
export type Errors<Data> = {
  [key in keyof Data]?: string | string[] | Errors<Data[key]> | null;
};

/** The touched object may only contain booleans per key. */
export type Touched<Data extends Obj> = {
  [key in keyof Data]: Data[key] extends Obj ? Touched<Data[key]> : boolean;
};

export type FormAction = (node: HTMLFormElement) => { destroy: () => void };

/** The return type for the `createForm` function. */
export interface Form<Data extends Obj> {
  /** Action function to be used with the `use` directive on your `form` elements. */
  form: FormAction;
  /** Writable store that contains the form's data. */
  data: Writable<Data>;
  /** Readable store that contains the form's validation errors. */
  errors: Readable<Errors<Data>>;
  /** Writable store that denotes if any field has been touched. */
  touched: Writable<Touched<Data>>;
  /** Function to handle submit to be passed to the on:submit event. Not necessary if using the `form` action. */
  handleSubmit: (e: Event) => void;
  /** Readable store containing only a boolean that represents if the form is valid. */
  isValid: Readable<boolean>;
  /** Writable store containing only a boolean that represents if the form is submitting. */
  isSubmitting: Writable<boolean>;
}
