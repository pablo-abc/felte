export type Subscriber<T> = (value: T) => void;
export type Unsubscriber = () => void;
export type Updater<T> = (value: T) => T;

export type Readable<T> = {
  subscribe(this: void, run: Subscriber<T>): Unsubscriber;
};

export type Writable<T> = Readable<T> & {
  set(this: void, value: T): void;
  update(this: void, updater: Updater<T>): void;
};

export type RecursivePartial<T extends Record<string, any>> = {
  [P in keyof T]?: T[P] extends Record<string, any> | Array<any>
    ? RecursivePartial<T[P]>
    : T[P];
};

export type RecursiveRequired<T extends Record<string, any>> = {
  [P in keyof T]-?: T[P] extends Record<string, any> | Array<any>
    ? RecursiveRequired<T[P]>
    : T[P];
};

export type ObjectSetter<Data extends Obj, Path extends string = string> = (<
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

export type UnknownObjectSetter<
  Data extends Obj,
  Path extends string = string
> = ((path: string, value: unknown) => void) &
  (<P extends Path, V extends Traverse<Data, P> = Traverse<Data, P>>(
    path: P,
    updater: (value: V) => unknown
  ) => void) &
  ((updater: (value: Data) => unknown) => void) &
  ((value: unknown) => void);

export type PartialErrorsSetter<
  Data extends Obj,
  Path extends string = string
> = (<
  P extends Path,
  V extends Traverse<AssignableErrors<Data>, P> = Traverse<
    AssignableErrors<Data>,
    P
  >
>(
  path: P,
  value: V
) => void) &
  (<
    P extends Path,
    V extends Traverse<AssignableErrors<Data>, P> = Traverse<
      AssignableErrors<Data>,
      P
    >
  >(
    path: P,
    updater: (value: V) => V
  ) => void) &
  ((value: AssignableErrors<Data>) => void) &
  ((updater: (value: Errors<Data>) => AssignableErrors<Data>) => void);

export type PrimitiveSetter<Data> = ((value: Data) => void) &
  ((updater: (value: Data) => Data) => void);

export type FieldsSetter<Data extends Obj, Path extends string = string> = (<
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

export type UnknownFieldsSetter<
  Data extends Obj,
  Path extends string = string
> = (<P extends Path>(path: P, value: unknown, shouldTouch?: boolean) => void) &
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
  [key in keyof Data]: Data[key] extends Obj | Obj[]
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
  setErrors: PartialErrorsSetter<Data, Path>;
  /** Helper function to set a warning on a specific field. */
  setWarnings: PartialErrorsSetter<Data, Path>;
  /** Helper function to set the value of the isDirty store */
  setIsDirty: PrimitiveSetter<boolean>;
  /** Helper function to set the value of the isSubmitting store */
  setIsSubmitting: PrimitiveSetter<boolean>;
  /** Helper function the set the value of the interacted store */
  setInteracted: PrimitiveSetter<string | null>;
  /** Helper function to set all values of the form. Useful for "initializing" values after the form has loaded. */
  setFields: FieldsSetter<Data, Path> | UnknownFieldsSetter<Data, Path>;
  /** Helper function to unset a field (remove it completely from your stores) */
  unsetField<P extends Path>(path: P): void;
  /** Helper function to reset a field to its initial value */
  resetField<P extends Path>(path: P): void;
  /** Helper function to swap the position of two fields in an array */
  swapFields<P extends Path>(path: P, from: number, to: number): void;
  /** Helper function to move a field to a new position */
  moveField<P extends Path>(path: P, from: number, to: number): void;
  /** Helper function that adds a field to an array of fields, by default at the end but you can define at which index you want the new item */
  addField: <
    P extends Path,
    V extends Traverse<Data, Path> = Traverse<Data, Path>
  >(
    path: P,
    value: V,
    index?: number
  ) => void;
  /** Helper function that validates every fields and touches all of them. It updates the `errors` and `warnings` store. */
  validate(): Promise<Errors<Data> | void>;
  /** Helper function to re-set the initialValues of Felte. No reactivity will be triggered but this will be the data the form will be reset to when caling `reset`. */
  setInitialValues(values: Data): void;
};

export type ValidatorOptions = {
  debounced?: boolean;
  level?: 'warning' | 'error';
};

export type AddValidatorFn<Data extends Obj> = (
  validator: ValidationFunction<Data>,
  options?: ValidatorOptions
) => void;

export type SetupCurrentForm<Data extends Obj> = {
  form?: never;
  controls?: never;
  stage: 'SETUP';
  config: FormConfig<Data>;
  setFields(values: Data): void;
  reset(): void;
  validate(): Promise<Errors<Data> | void>;
  addValidator: AddValidatorFn<Data>;
  addTransformer(transformer: TransformFunction<Data>): void;
} & Stores<Data> &
  Omit<Form<Data>, 'form'>;

export type MountedCurrentForm<Data extends Obj> = {
  form: HTMLFormElement;
  controls: FormControl[];
  stage: 'MOUNT' | 'UPDATE';
  config: FormConfig<Data>;
  setFields(values: Data): void;
  reset(): void;
  validate(): Promise<Errors<Data> | void>;
  addValidator: AddValidatorFn<Data>;
  addTransformer(transformer: TransformFunction<Data>): void;
} & Stores<Data> &
  Omit<Form<Data>, 'form'>;

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
  | AssignableErrors<Data>
  | undefined
  | Promise<AssignableErrors<Data> | undefined>;

export type TransformFunction<Data extends Obj> = (values: unknown) => Data;

export type SubmitContext<Data extends Obj> = {
  form?: HTMLFormElement;
  controls?: FormControl[];
  config: FormConfig<Data>;
} & Omit<
  Helpers<Data>,
  'validate' | 'setIsSubmitting' | 'setIsDirty' | 'setInteracted'
>;

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
  initialValues?: RecursivePartial<Data>;
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
  ) => Promise<void | AssignableErrors<Data>> | void | AssignableErrors<Data>;
  /** Optional function/s to extend Felte's functionality. */
  extend?: Extender<Data> | Extender<Data>[];
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
  ) => Promise<void | AssignableErrors<Data>> | void | AssignableErrors<Data>;
  /** Optional function/s to extend Felte's functionality. */
  extend?: Extender<Data> | Extender<Data>[];
  [key: string]: unknown;
};

/**
 * Configuration object type. `initialValues` is optional.
 */
export type FormConfig<Data extends Obj> =
  | FormConfigWithTransformFn<Data>
  | FormConfigWithoutTransformFn<Data>;

type AnyObj = Record<string, any>;
type AnyArr = Array<any>;

/** The errors object may contain either a string or array or string per key. */
export type Errors<Data extends AnyObj | AnyArr> = Data extends AnyArr
  ? Data[number] extends AnyObj
    ? Errors<Data[number]>[]
    : string[] | null
  : Data extends Date | File | File[]
  ? string[] | null
  : Data extends AnyObj
  ? {
      [key in keyof Data]: Data[key] extends AnyObj | AnyArr
        ? Errors<Data[key]>
        : string[] | null;
    }
  : any;

export type Keyed<Data extends AnyObj | AnyArr> = Data extends AnyArr
  ? Data[number] extends AnyObj
    ? (Keyed<Data[number]> & { key: string })[]
    : Data[number][]
  : Data extends Date | File | File[]
  ? Data
  : Data extends AnyObj
  ? {
      [key in keyof Data]: Data[key] extends AnyObj | AnyArr
        ? Keyed<Data[key]>
        : Data[key];
    }
  : any;

/** The errors object may contain either a string or array or string per key. */
export type AssignableErrors<Data extends AnyObj | AnyArr> = Data extends AnyArr
  ? Data[number] extends AnyObj
    ? AssignableErrors<Data[number]>[]
    : string | string[] | null | undefined
  : Data extends Date | File | File[]
  ? string | string[] | null | undefined
  : Data extends AnyObj
  ? {
      [key in keyof Data]?: Data[key] extends AnyObj | AnyArr
        ? AssignableErrors<Data[key]> | undefined
        : string | string[] | null | undefined;
    }
  : any;

/** The touched object may only contain booleans per key. */
export type Touched<Data extends AnyObj | AnyArr> = Data extends AnyArr
  ? Data[number] extends AnyObj
    ? Touched<Data[number]>[]
    : boolean
  : Data extends Date | File | File[]
  ? boolean
  : Data extends AnyObj
  ? {
      [key in keyof Data]: Data[key] extends AnyObj | AnyArr
        ? Touched<Data[key]>
        : boolean;
    }
  : any;

export type FormAction = (node: HTMLFormElement) => { destroy: () => void };

export type TransWritable<Data extends Obj> = {
  subscribe(subscriber: (values: Keyed<Data>) => any): () => void;
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
  data: KeyedWritable<Data> & StoreExt;
};

export type PartialWritableErrors<Data extends Obj> = {
  subscribe: Writable<Errors<Data>>['subscribe'];
  set: Writable<AssignableErrors<Data>>['set'];
  update: (updater: (value: Errors<Data>) => AssignableErrors<Data>) => void;
};

export type KeyedWritable<Data extends Obj> = Omit<
  Writable<Data>,
  'subscribe'
> & {
  subscribe(subscriber: (values: Keyed<Data>) => any): () => void;
};

/** The stores that `createForm` creates. */
export type Stores<Data extends Obj, StoreExt = Record<string, any>> = {
  /** Writable store that contains the form's data. */
  data: (KeyedWritable<Data> | TransWritable<Data>) & StoreExt;
  /** Writable store that contains the form's validation errors. */
  errors: PartialWritableErrors<Data> & StoreExt;
  /** Writable store that contains warnings for the form. These won't prevent a submit from happening. */
  warnings: PartialWritableErrors<Data> & StoreExt;
  /** Writable store that denotes if any field has been touched. */
  touched: Writable<Touched<Data>> & StoreExt;
  /** Writable store containing only a boolean that represents if the form is submitting. */
  isSubmitting: Writable<boolean> & StoreExt;
  /** Readable store containing only a boolean that represents if the form is valid. */
  isValid: Readable<boolean> & StoreExt;
  /** Readable store containing only a boolean that represents if the form is currently validating. */
  isValidating: Readable<boolean> & StoreExt;
  /** Readable store containing only a boolean that represents if the form is dirty. */
  isDirty: Writable<boolean> & StoreExt;
  /** Writable store containing either `null` or the name of the last field the user interacted with. */
  interacted: Writable<string | null> & StoreExt;
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
  ) => (e?: Event) => Promise<void>;
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

type TraverseImpl<T, Path extends unknown[]> = Path extends [
  infer K,
  ...infer R
]
  ? K extends keyof T
    ? TraverseImpl<T[K], R>
    : K extends `${number}`
    ? T extends Array<any>
      ? TraverseImpl<T[number], R> | undefined
      : any
    : any
  : T;

export type Traverse<
  T extends Record<string, any> | Array<any>,
  Path extends string
> = TraverseImpl<T, Split<Path>>;
