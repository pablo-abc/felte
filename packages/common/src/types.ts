import type { Readable, Writable } from 'svelte/store';

export type ObjectSetter<Data, Value> = ((path: string, value: Value) => void) &
  ((path: string, updater: (value: unknown) => Value) => void) &
  ((value: Data) => void) &
  ((updater: (value: Data) => Data) => void);

export type UnknownObjectSetter<Data, Value = FieldValue | FieldValue[]> = ((
  path: string,
  value: Value
) => void) &
  ((path: string, updater: (value: unknown) => Value) => void) &
  ((updater: (value: Data) => unknown) => void) &
  ((value: unknown) => void);

export type PrimitiveSetter<Data> = ((value: Data) => void) &
  ((updater: (value: Data) => Data) => void);

export type FieldsSetter<Data, Value = FieldValue | FieldValue[]> = ((
  path: string,
  value: Value,
  shouldTouch?: boolean
) => void) &
  ((
    path: string,
    updater: (value: unknown) => Value,
    shouldTouch?: boolean
  ) => void) &
  ((value: Data) => void) &
  ((updater: (value: Data) => Data) => void);

export type UnknownFieldsSetter<Data, Value = FieldValue | FieldValue[]> = ((
  path: string,
  value: Value,
  shouldTouch?: boolean
) => void) &
  ((
    path: string,
    updater: (value: unknown) => Value,
    shouldTouch?: boolean
  ) => void) &
  ((value: unknown) => void) &
  ((updater: (value: Data) => unknown) => void);

export type Setter<Data, Value> =
  | ObjectSetter<Data, Value>
  | PrimitiveSetter<Data>;

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
  warn?: FormConfig<Data>['warn'];
  onSuccess?: FormConfig<Data>['onSuccess'];
  onError?: FormConfig<Data>['onError'];
};

export type KnownHelpers<Data extends Obj> = Omit<
  Helpers<Data>,
  'setData' | 'setFields'
> & {
  setData: ObjectSetter<Data, FieldValue | FieldValue[]>;
  setFields: FieldsSetter<Data>;
};

export type UnknownHelpers<Data extends Obj> = Omit<
  Helpers<Data>,
  'setData' | 'setFields'
> & {
  setData: UnknownObjectSetter<Data>;
  setFields: UnknownFieldsSetter<Data>;
};

export type Helpers<Data extends Obj> = {
  /** Function that resets the form to its initial values */
  reset(): void;
  /** Helper function to set the values in the data store */
  setData:
    | ObjectSetter<Data, FieldValue | FieldValue[]>
    | UnknownObjectSetter<Data>;
  /** Helper function to touch a specific field. */
  setTouched: ObjectSetter<Touched<Data>, boolean>;
  /** Helper function to set an error to a specific field. */
  setErrors: ObjectSetter<Errors<Data>, string | string[]>;
  /** Helper function to set a warning on a specific field. */
  setWarnings: ObjectSetter<Errors<Data>, string | string[]>;
  /** Helper function to set the value of the isDirty store */
  setIsDirty: PrimitiveSetter<boolean>;
  /** Helper function to set the value of the isSubmitting store */
  setIsSubmitting: PrimitiveSetter<boolean>;
  /** Helper function to set all values of the form. Useful for "initializing" values after the form has loaded. */
  setFields: FieldsSetter<Data> | UnknownFieldsSetter<Data>;
  /** Helper function to unset a field (remove it completely from your stores) */
  unsetField(path: string): void;
  /** Helper function to reset a field to its initial value */
  resetField(path: string): void;
  /** Helper function that adds a field to an array of fields, by default at the end but you can define at which index you want the new item */
  addField(
    path: string,
    value: FieldValue | FieldValue[],
    index?: number
  ): void;
  /** Helper function that validates every fields and touches all of them. It updates the `errors` and `warnings` store. */
  validate(): Promise<Errors<Data> | void>;
  /** Helper function to re-set the initialValues of Felte. No reactivity will be triggered but this will be the data the form will be reset to when caling `reset`. */
  setInitialValues(values: Data): void;
};

export type SetupCurrentForm<Data extends Obj> = {
  form?: never;
  controls?: never;
  stage: 'SETUP';
  errors: Writable<Errors<Data>>;
  warnings: Writable<Errors<Data>>;
  data: Writable<Data>;
  touched: Writable<Touched<Data>>;
  config: FormConfig<Data>;
  setFields(values: Data): void;
  reset(): void;
  validate(): Promise<Errors<Data> | void>;
  addValidator(validator: ValidationFunction<Data>): void;
  addWarnValidator(validator: ValidationFunction<Data>): void;
  addTransformer(transformer: TransformFunction<Data>): void;
};

export type MountedCurrentForm<Data extends Obj> = {
  form: HTMLFormElement;
  controls: FormControl[];
  stage: 'MOUNT' | 'UPDATE';
  errors: Writable<Errors<Data>>;
  warnings: Writable<Errors<Data>>;
  data: Writable<Data>;
  touched: Writable<Touched<Data>>;
  config: FormConfig<Data>;
  setFields(values: Data): void;
  reset(): void;
  validate(): Promise<Errors<Data> | void>;
  addValidator(validator: ValidationFunction<Data>): void;
  addWarnValidator(validator: ValidationFunction<Data>): void;
  addTransformer(transformer: TransformFunction<Data>): void;
};

export type CurrentForm<Data extends Obj> =
  | MountedCurrentForm<Data>
  | SetupCurrentForm<Data>;

export type OnSubmitErrorState<Data extends Obj> = {
  data: Data;
  errors: Errors<Data>;
};

export type ExtenderHandler<Data extends Obj> = {
  destroy?: () => void;
  onSubmitError?: (state: OnSubmitErrorState<Data>) => void;
};

export type Extender<Data extends Obj = Obj> = (
  currentForm: MountedCurrentForm<Data> | SetupCurrentForm<Data>
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
  | null
  | undefined;

export type FormControl =
  | HTMLInputElement
  | HTMLTextAreaElement
  | HTMLSelectElement;

export type ValidationFunction<Data extends Obj> = (
  values: Data
) => Errors<Data> | undefined | Promise<Errors<Data> | undefined>;

export type TransformFunction<Data extends Obj> = (values: unknown) => Data;

export type SubmitContext<Data extends Obj> = {
  form?: HTMLFormElement;
  controls?: FormControl[];
  config: FormConfig<Data>;
};

/**
 * Configuration object when `initialValues` is not set. Used when using the `form` action.
 */
export type FormConfigWithoutTransformFn<Data extends Obj> = {
  transform?: never;
  /** Optional object with the initial values of the form **/
  initialValues?: Data;
  /** Optional function to validate the data. */
  validate?: ValidationFunction<Data> | ValidationFunction<Data>[];
  /** Optional function to set warnings based on the current state of your data. */
  warn?: ValidationFunction<Data> | ValidationFunction<Data>[];
  /** Optional function to handle the form data on submit. */
  onSubmit?: (
    values: Data,
    context: SubmitContext<Data>
  ) => Promise<unknown> | unknown;
  /** Optional function to react to a submission success. It will receive whatever you return from `onSubmit`. If not using `onSubmit` it will receive the `Response` from the default submit handler */
  onSuccess?: (response: unknown) => void | Promise<void>;
  /** Optional function that accepts any thrown exceptions from the onSubmit function. You can return an object with the same shape [[`Errors`]] for a reporter to use it. */
  onError?: (
    error: unknown
  ) => Promise<void | Errors<Data>> | void | Errors<Data>;
  /** Optional function/s to extend Felte's functionality. */
  extend?: Extender<Data> | Extender<Data>[];
  /** Optional array that sets which events should trigger a field to be touched. */
  touchTriggerEvents?: {
    change?: boolean;
    input?: boolean;
    blur?: boolean;
  };
  [key: string]: unknown;
};

/**
 * Configuration object when `initialValues` is set. Used when using the `data` store to bind to form inputs.
 */
export type FormConfigWithTransformFn<Data extends Obj> = {
  transform: TransformFunction<Data> | TransformFunction<Data>[];
  /** Optional object with the initial values of the form **/
  initialValues?: unknown;
  /** Optional function to validate the data. */
  validate?: ValidationFunction<Data> | ValidationFunction<Data>[];
  /** Optional function to set warnings based on the current state of your data. */
  warn?: ValidationFunction<Data> | ValidationFunction<Data>[];
  /** Required function to handle the form data on submit. */
  onSubmit?: (
    values: Data,
    context: SubmitContext<Data>
  ) => Promise<unknown> | unknown;
  /** Optional function to react to a submission success. It will receive whatever you return from `onSubmit`. If not using `onSubmit` it will receive the `Response` from the default submit handler */
  onSuccess?: (response: unknown) => void | Promise<void>;
  /** Optional function that accepts any thrown exceptions from the onSubmit function. You can return an object with the same shape [[`Errors`]] for a reporter to use it. */
  onError?: (
    errors: unknown
  ) => Promise<void | Errors<Data>> | void | Errors<Data>;
  /** Optional function/s to extend Felte's functionality. */
  extend?: Extender<Data> | Extender<Data>[];
  /** Optional array that sets which events should trigger a field to be touched. */
  touchTriggerEvents?: {
    change?: boolean;
    input?: boolean;
    blur?: boolean;
  };
  [key: string]: unknown;
};

/**
 * Configuration object type. `initialValues` is optional.
 */
export type FormConfig<Data extends Obj> =
  | FormConfigWithTransformFn<Data>
  | FormConfigWithoutTransformFn<Data>;

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

export type TransWritable<Data extends Obj> = Omit<
  Writable<Data>,
  'set' | 'update'
> & {
  set(value: unknown): void;
  update(updater: (value: Data) => unknown): void;
};

export type UnknownStores<
  Data extends Obj,
  StoreExt = Record<string, any>
> = Omit<Stores<Data, StoreExt>, 'data'> & {
  data: TransWritable<Data> & StoreExt;
};

export type KnownStores<
  Data extends Obj,
  StoreExt = Record<string, any>
> = Omit<Stores<Data, StoreExt>, 'data'> & {
  data: Writable<Data> & StoreExt;
};

/** The stores that `createForm` creates. */
export type Stores<Data extends Obj, StoreExt = Record<string, any>> = {
  /** Writable store that contains the form's data. */
  data: (Writable<Data> | TransWritable<Data>) & StoreExt;
  /** Writable store that contains the form's validation errors. */
  errors: Writable<Errors<Data>> & StoreExt;
  /** Writable store that contains warnings for the form. These won't prevent a submit from happening. */
  warnings: Writable<Errors<Data>> & StoreExt;
  /** Writable store that denotes if any field has been touched. */
  touched: Writable<Touched<Data>> & StoreExt;
  /** Writable store containing only a boolean that represents if the form is submitting. */
  isSubmitting: Writable<boolean> & StoreExt;
  /** Readable store containing only a boolean that represents if the form is valid. */
  isValid: Readable<boolean> & StoreExt;
  /** Readable store containing only a boolean that represents if the form is dirty. */
  isDirty: Writable<boolean> & StoreExt;
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
};

export type StoreFactory<Ext = Record<string, any>> = <Value>(
  initialValue: Value
) => Writable<Value> & Ext;
