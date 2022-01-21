import type { Readable, Writable } from 'svelte/store';

export type RecursivePartial<T> = {
  [P in keyof T]?: RecursivePartial<T[P]>;
};

export type RecursiveRequired<T> = {
  [P in keyof T]-?: RecursiveRequired<T>;
};

export type ObjectSetter<Data, Path extends string = string> = (<
  P extends Path,
  V extends Traverse<Data, P> = Traverse<Data, P>
>(
  path: P,
  value: V
) => void) &
  (<P extends Path, V extends Traverse<Data, P> = Traverse<Data, P>>(
    path: P,
    updater: (value: V) => V
  ) => void) &
  ((value: Data) => void) &
  ((updater: (value: Data) => Data) => void);

export type UnknownObjectSetter<Data, Path extends string = string> = ((
  path: Path,
  value: unknown
) => void) &
  (<P extends Path, V extends Traverse<Data, P> = Traverse<Data, P>>(
    path: P,
    updater: (value: V) => unknown
  ) => void) &
  ((updater: (value: Data) => unknown) => void) &
  ((value: unknown) => void);

export type PrimitiveSetter<Data> = ((value: Data) => void) &
  ((updater: (value: Data) => Data) => void);

export type FieldsSetter<Data, Path extends string = string> = (<
  P extends Path,
  V extends Traverse<Data, P> = Traverse<Data, P>
>(
  path: P,
  value: V,
  shouldTouch?: boolean
) => void) &
  (<P extends Path, V extends Traverse<Data, P> = Traverse<Data, P>>(
    path: P,
    updater: (value: V) => V,
    shouldTouch?: boolean
  ) => void) &
  ((value: Data) => void) &
  ((updater: (value: Data) => Data) => void);

export type UnknownFieldsSetter<Data, Path extends string = string> = (<
  P extends Path
>(
  path: P,
  value: unknown,
  shouldTouch?: boolean
) => void) &
  (<P extends Path, V extends Traverse<Data, P> = Traverse<Data, P>>(
    path: P,
    updater: (value: V) => unknown,
    shouldTouch?: boolean
  ) => void) &
  ((value: unknown) => void) &
  ((updater: (value: Data) => unknown) => void);

export type Setter<Data, Path extends string = string> = Data extends Record<
  string,
  any
>
  ? ObjectSetter<Data, Path>
  : PrimitiveSetter<Data>;

export type DeepSetResult<Data extends Obj | Obj[], Value> = {
  [key in keyof Data]: Data[key] extends Obj
    ? DeepSetResult<Data[key], Value>
    : Data[key] extends Obj[]
    ? DeepSetResult<Data[key], Value>
    : Value;
};

export type CreateSubmitHandlerConfig<Data extends Obj> = {
  onSubmit?: FormConfig<Data>['onSubmit'];
  validate?: FormConfig<Data>['validate'];
  warn?: FormConfig<Data>['warn'];
  onSuccess?: FormConfig<Data>['onSuccess'];
  onError?: FormConfig<Data>['onError'];
};

export type KnownHelpers<Data extends Obj, Path extends string = string> = Omit<
  Helpers<Data, Path>,
  'setData' | 'setFields'
> & {
  setData: ObjectSetter<Data, Path>;
  setFields: FieldsSetter<Data, Path>;
};

export type UnknownHelpers<
  Data extends Obj,
  Path extends string = string
> = Omit<Helpers<Data, Path>, 'setData' | 'setFields'> & {
  setData: UnknownObjectSetter<Data, Path>;
  setFields: UnknownFieldsSetter<Data, Path>;
};

export type Helpers<Data extends Obj, Path extends string = string> = {
  /** Function that resets the form to its initial values */
  reset(): void;
  /** Helper function to set the values in the data store */
  setData: ObjectSetter<Data, Path> | UnknownObjectSetter<Data, Path>;
  /** Helper function to touch a specific field. */
  setTouched: ObjectSetter<Touched<Data>, Path>;
  /** Helper function to set an error to a specific field. */
  setErrors: ObjectSetter<RecursivePartial<Errors<Data>>, Path>;
  /** Helper function to set a warning on a specific field. */
  setWarnings: ObjectSetter<RecursivePartial<Errors<Data>>, Path>;
  /** Helper function to set the value of the isDirty store */
  setIsDirty: PrimitiveSetter<boolean>;
  /** Helper function to set the value of the isSubmitting store */
  setIsSubmitting: PrimitiveSetter<boolean>;
  /** Helper function to set all values of the form. Useful for "initializing" values after the form has loaded. */
  setFields: FieldsSetter<Data, Path> | UnknownFieldsSetter<Data, Path>;
  /** Helper function to unset a field (remove it completely from your stores) */
  unsetField(path: Path): void;
  /** Helper function to reset a field to its initial value */
  resetField(path: Path): void;
  /** Helper function that adds a field to an array of fields, by default at the end but you can define at which index you want the new item */
  addField(path: Path, value: FieldValue | FieldValue[], index?: number): void;
  /** Helper function that validates every fields and touches all of them. It updates the `errors` and `warnings` store. */
  validate(): Promise<Errors<Data> | void>;
  /** Helper function to re-set the initialValues of Felte. No reactivity will be triggered but this will be the data the form will be reset to when caling `reset`. */
  setInitialValues(values: Data): void;
};

export type SetupCurrentForm<Data extends Obj> = {
  form?: never;
  controls?: never;
  stage: 'SETUP';
  errors: PartialWritable<Errors<Data>>;
  warnings: PartialWritable<Errors<Data>>;
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
  errors: PartialWritable<Errors<Data>>;
  warnings: PartialWritable<Errors<Data>>;
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
) =>
  | RecursivePartial<Errors<Data>>
  | undefined
  | Promise<RecursivePartial<Errors<Data>> | undefined>;

export type TransformFunction<Data extends Obj> = (values: unknown) => Data;

export type SubmitContext<Data extends Obj> = {
  form?: HTMLFormElement;
  controls?: FormControl[];
  config: FormConfig<Data>;
} & Omit<Helpers<Data>, 'validate' | 'setIsSubmitting' | 'setIsDirty'>;

type DebouncedConfig<Data extends Obj> = {
  /** Optional function to validate the data. */
  validate?: ValidationFunction<Data> | ValidationFunction<Data>[];
  /** Optional function to set warnings based on the current state of your data. */
  warn?: ValidationFunction<Data> | ValidationFunction<Data>[];
  /** Optional number to set timeout in milliseconds */
  timeout?: number;
  /** Overrides timeout for validate */
  validateTimeout?: number;
  /** Overrides timeout for warn */
  warnTimeout?: number;
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
  /** Optional object containing properties to be debounced */
  debounced?: DebouncedConfig<Data>;
  /** Optional function to handle the form data on submit. */
  onSubmit?: (
    values: Data,
    context: SubmitContext<Data>
  ) => Promise<unknown> | unknown;
  /** Optional function to react to a submission success. It will receive whatever you return from `onSubmit`. If not using `onSubmit` it will receive the `Response` from the default submit handler */
  onSuccess?: (
    response: unknown,
    context: SubmitContext<Data>
  ) => void | Promise<void>;
  /** Optional function that accepts any thrown exceptions from the onSubmit function. You can return an object with the same shape [[`Errors`]] for a reporter to use it. */
  onError?: (
    error: unknown,
    context: SubmitContext<Data>
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
  /** Optional object containing properties to be debounced */
  debounced?: DebouncedConfig<Data>;
  /** Required function to handle the form data on submit. */
  onSubmit?: (
    values: Data,
    context: SubmitContext<Data>
  ) => Promise<unknown> | unknown;
  /** Optional function to react to a submission success. It will receive whatever you return from `onSubmit`. If not using `onSubmit` it will receive the `Response` from the default submit handler */
  onSuccess?: (
    response: unknown,
    context: SubmitContext<Data>
  ) => void | Promise<void>;
  /** Optional function that accepts any thrown exceptions from the onSubmit function. You can return an object with the same shape [[`Errors`]] for a reporter to use it. */
  onError?: (
    error: unknown,
    context: SubmitContext<Data>
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
export type Errors<
  Data extends Record<string, any> | Record<string, any>[]
> = Data extends Obj | Obj[]
  ? {
      [key in keyof Data]: Data[key] extends Obj
        ? Errors<Data[key]>
        : Data[key] extends Obj[]
        ? Errors<Data[key]>
        : string | string[] | null;
    }
  : Data;

/** The touched object may only contain booleans per key. */
export type Touched<Data extends Record<string, any> | Obj[]> = Data extends
  | Obj
  | Obj[]
  ? {
      [key in keyof Data]: Data[key] extends Obj
        ? Touched<Data[key]>
        : Data[key] extends Obj[]
        ? Touched<Data[key]>
        : boolean | boolean[];
    }
  : Data;

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

export type PartialWritable<Data extends Obj> = {
  subscribe: Writable<Data>['subscribe'];
  set: Writable<RecursivePartial<Data>>['set'];
  update: Writable<RecursivePartial<Data>>['update'];
};

/** The stores that `createForm` creates. */
export type Stores<Data extends Obj, StoreExt = Record<string, any>> = {
  /** Writable store that contains the form's data. */
  data: (Writable<Data> | TransWritable<Data>) & StoreExt;
  /** Writable store that contains the form's validation errors. */
  errors: PartialWritable<Errors<Data>> & StoreExt;
  /** Writable store that contains warnings for the form. These won't prevent a submit from happening. */
  warnings: PartialWritable<Errors<Data>> & StoreExt;
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

type Prev = [
  never,
  0,
  1,
  2,
  3,
  4,
  5,
  6,
  7,
  8,
  9,
  10,
  11,
  12,
  13,
  14,
  15,
  16,
  17,
  18,
  19,
  20,
  ...0[]
];

type Join<K, P> = K extends string | number
  ? P extends string | number
    ? `${K}${'' extends P ? '' : '.'}${P}`
    : never
  : never;

export type Paths<T, D extends number = 10> = [D] extends [never]
  ? never
  : T extends object
  ? {
      [K in keyof T]-?: K extends string | number
        ? `${K}` | Join<K, Paths<T[K], Prev[D]>>
        : never;
    }[keyof T]
  : '';

type Split<Path extends string> = Path extends `${infer T}.${infer R}`
  ? [T, ...Split<R>]
  : [Path];

type TraverseImpl<
  T extends Record<string, any> | Array<any>,
  Path extends [string, ...string[]]
> = Path extends [infer K, ...infer R]
  ? K extends keyof T
    ? T[K] extends Record<string, any>
      ? R extends [string, ...string[]]
        ? TraverseImpl<T[K], R>
        : T[K]
      : T[K]
    : K extends `${number}`
    ? T extends Array<any>
      ? R extends [string, ...string[]]
        ? TraverseImpl<T[number], R>
        : T[number]
      : never
    : unknown
  : never;

export type Traverse<
  T extends Record<string, any> | Array<any>,
  Path extends string
> = TraverseImpl<RecursiveRequired<T>, Split<Path>>;
