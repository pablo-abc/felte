# Felte: A form library for Svelte

[![Tests](https://github.com/pablo-abc/felte/workflows/Tests/badge.svg)](https://github.com/pablo-abc/felte/actions/workflows/test.yml)
[![Bundle size](https://img.shields.io/bundlephobia/min/felte)](https://bundlephobia.com/result?p=felte)
[![NPM Version](https://img.shields.io/npm/v/felte)](https://www.npmjs.com/package/felte)
[![NPM Downloads](https://img.shields.io/npm/dw/felte)](https://www.npmjs.com/package/felte)
[![codecov](https://codecov.io/gh/pablo-abc/felte/branch/main/graph/badge.svg?token=T73OJZ50LC)](https://codecov.io/gh/pablo-abc/felte)

Felte is a simple to use form library for Svelte. It is based on Svelte stores and Svelte actions for its functionality. No `Field` or `Form` components, just plain stores and actions to build your form however you like. You can see it in action in this [CodeSandbox demo](https://codesandbox.io/s/felte-demo-wce2h?file=/App.svelte)!

**STATUS:** Useable. Felte's API is stable enough to be used. I feel the main API is solid enough to not need breaking changes that fast, but more usage input would be useful. Reporter packages migh have breaking changes more often. If you're interested please give it a try and feel free to open an issue if there's anything missing! We would still recommend pinning the version of Felte or any of its packages and checking the changelogs whenever you want to upgrade.

## Features

- Single action to make your form reactive.
- Use HTML5 native elements to create your form. (Only the `name` attribute is necessary).
- Provides stores and helper functions to handle more complex use cases.
- No assumptions on your validation strategy. Use any validation library you want or write your own strategy.
- Handles addition and removal of form controls during runtime.
- Official solutions for error reporting using `reporter` packages.
- Well tested. Currently at [99% code coverage](https://app.codecov.io/gh/pablo-abc/felte) and constantly working on improving test quality.
- Supports validation with [yup](./packages/validator-yup/README.md), [zod](./packages/validator-zod/README.md) and [superstruct](./packages/validator-superstruct/README.md).
- Easily [extend its functionality](https://felte.dev/docs#extending-felte).

## Simple usage example

```html
<script>
  import { createForm } from 'felte'

  const { form } = createForm({
    onSubmit: async (values) => {
      /* call to an api */
    },
  })
</script>

<form use:form>
  <input type=text name=email>
  <input type=password name=password>
  <input type=submit value="Sign in">
</form>
```

## Installation

```sh
npm install --save felte

# Or if you use yarn

yarn add felte
```

## Usage

Felte exports a single `createForm` function that accepts a config object with the following interface:

```typescript
type ValidationFunction<Data extends Obj> = (
  values: Data
) => Errors<Data> | undefined | Promise<Errors<Data> | undefined>;

type SubmitContext<Data extends Obj> = {
  form?: HTMLFormElement;
  controls?: FormControl[];
  config: FormConfig<Data>;
};

interface FormConfig<D extends Record<string, unknown>> {
  initialValues?: D;
  validate?: ValidationFunction<Data> | ValidationFunction<Data>[];
  onSubmit: (values: D, context: SubmitContext) => void;
  onError?: (errors: unknown) => void | Errors<D>;
  extend?: Extender | Extender[];
}
```

- `initialValues` refers to the initial values of the form.
- `validate` is a custom validation function that must return an object with the same props as initialValues, but with error messages or `undefined` as values. It can be an array of functions whose validation errors will be merged.
- `onSubmit` is the function that will be executed when the form is submited.
- `onError` is a an optional function that will run if the submit throws an exception. It will contain the error catched. If you return an object with the same shape as `Errors`, these errors can be reported by a reporter.
- `extend` a function or list of functions to extend Felte's behaviour. Currently it can be used to add `reporters` to Felte, these can handle error reporting for you. You can read more about them in [Felte's documentation](https://felte.dev/docs#reporters).

When called, `createForm` will return an object with the following interface:

```typescript
type FormAction = (node: HTMLFormElement) => { destroy: () => void };
type FieldValue = string | string[] | boolean | number | File | File[];
type CreateSubmitHandlerConfig<D> = {
  onSubmit: (values: D) => void;
  validate: (values: D) => Promise<Errors<D> | undefined>;
  onError: (errors: unknown) => void | Errors<D>;
}

export interface Form<D extends Record<string, unknown>> {
  form: FormAction;
  data: Writable<D>;
  errors: Readable<Errors<D>>;
  touched: Writable<Touched<D>>;
  handleSubmit: (e: Event) => void;
  isValid: Readable<boolean>;
  isSubmitting: Writable<boolean>;
  isDirty: Writable<boolean>;
  // Helper functions:
  setTouched: (path: string) => void;
  setError: (path: string, error: string | string[]) => void;
  setField: (path: string, value?: FieldValue, touch?: boolean) => void;
  getField: (path: string) => FieldValue | FieldValue[];
  setFields: (values: Data) => void;
  validate: (values: D) => Promise<Errors<D> | undefined>;
  reset: () => void;
  setInitialValues: (values: D) => void;
  createSubmitHandler: (config?: CreateSubmitHandlerConfig<D>) => (event?: Event) => void;
}
```

- `form` is a function to be used with the `use:` directive for Svelte.
- `data` is a writable store with the current values from the form.
- `errors` is a readable store with the current errors.
- `touched` is a readable store that defines if the fields have been touched. It's an object with the same keys as data, but with boolean values.
- `handleSubmit` is the event handler to be passed to `on:submit`.
- `isValid` is a readable store that only holds a boolean denoting if the form has any errors or not.
- `isSubmitting` is a writable store that only holds a boolean denoting if the form is submitting or not.
- `isDirty` is a writable store that only holds a boolean denoting if the form is dirty or not.
- `setTouched` is a helper function to touch a specific field.
- `setError` is a helper function to set an error in a specific field.
- `setField` is a helper function to set the data of a specific field. If undefined, it clears the field. If you set `touch` to `false` the field will not be touched with this change.
- `getField` is a helper function to get a value from `data` using a string path.
- `setFields` is a helper function to set the data of all fields.
- `validate` is a helper function that forces validation of the whole form, updating the `errors` store and touching every field. Similar to what happens on submit.
- `reset` is a helper function that resets the form to its original values when the page was loaded.
- `setInitialValues` is a helper function that sets the initialValues Felte handles internally. If called after initialization of the form, these values will be used when calling `reset`.
- `createSubmitHandler` is a helper function that creates a submit handler with overriden `onSubmit`, `onError` and/or `validate` functions. If no config is passed it uses the default configuration from `createForm`.

> If the helper functions are called before initialization of the form, whatever you set will be overwritten.

If a `validate` function is provided, Felte will add a `novalidate` to the form so it doesn't clash with the browser's built-in validations such as the ones resulting from `required`, `pattern` or due to types such as `email` or `url`. This is done on JavaScript's mount so the browser's validations will be run if JavaScript does not load. You may add these attributes anyway for accessibility purposes, and leaving them in may help you make these forms works even if JavaScript hasn't loaded yet. If a `validate` function is not defined, Felte will not interfere with the browser's validation.

### Using the form action

The recommended way to use it is by using the `form` action from `createForm` and using it in the form element of your form.

```html
<script>
  import { createForm } from 'felte'
  // install with `yarn add @felte/reporter-tippy`
  import reporter from '@felte/reporter-tippy'

  const { form, data, errors } = createForm({
    validate: (values) => {
      /* validate and return errors found */
    },
    onSubmit: async (values) => {
      /* call to an api */
    },
    extend: reporter,
  })

  $: console.log($data)
  $: console.log($errors)
</script>

<form use:form>
  <input type=text name=email>
  <input type=password name=password>
  <input type=submit value="Sign in">
</form>
```

That's all you need! With the example above you'll see **Felte** automatically updating the values of `data` when you type, as well as `errors` when finding an error. Note that the only required property for `createForm` is `onSubmit`.

Also note that using the `data` and `errors` store is completely optional in this method, since you already get access to the values of the form in the `onSubmit` function, and validation errors are reported with the browser's Constraint Validation API by using the `@felte/reporter-cvapi` package.

> If using Felte this way, make sure to set the `name` attributes of your inputs since that is what Felte uses to map to the `data` store.

> Default values are taken from the fields' `value` and/or `checked` attributes. `initialValues` is ignored if you use this approach.

Using this approach `data` will be undefined until the form element loads.

#### Nested forms

Felte supports the usage of nested objects for forms by setting the name of an input to the format of `object.prop`. It supports multiple levels. The behaviour is the same as previously explained, taking the default values from the `value` and/or `checked` attributes when appropriate.

```html
<form use:form>
  <input name="account.email">
  <input name="account.password">
  <input name="profile.firstName">
  <input name="profile.lastName">
  <input type="submit" value="Create account">
</form>
```

You can also "namespace" the inputs using the `fieldset` tag like this:

```html
<form use:form>
  <fieldset name="account">
    <input name="email">
    <input name="password">
  </fieldset>
  <fieldset name="profile">
    <input name="firstName">
    <input name="lastName">
  </fieldset>
  <input type="submit" value="Create account">
</form>
```

Both of these would result in a data object with this shape:

```js
{
  account: {
    email: '',
    password: '',
  },
  profile: {
    firstName: '',
    lastName: '',
  },
}
```

Again, be mindful of the fact that `data` will be undefined until the form element loads.

#### Dynamic forms

You can freely add/remove fields from the form and Felte will handle it.

```html
<form use:form>
  <fieldset name="account">
    <input name="email">
    <input name="password">
  </fieldset>
  {#if condition}
    <fieldset name="profile" data-felte-unset-on-remove=true>
      <input name="firstName">
      <input name="lastName" data-felte-unset-on-remove=false>
    </fieldset>
  {/if}
  <input type="submit" value="Create account">
</form>
```

The `data-felte-unset-on-remove=true` tells Felte to remove the property from the data object when the HTML element is removed from the DOM. By default this is false. If you do not set this attribute to `true`, the properties from the removed elements will remain in the data object untouched.

You can set the `data-felte-unset-on-remove=true` attribute to a `fieldset` element and all the elements contained within the fieldset will be unset on removal of the node, unless any element within the fieldset element have `data-felte-unset-on-remove` set to false.

> Felte takes any value that is not `true` as `false` on the `data-felte-unset-on-remove` attribute.

## Binding to inputs

Since `data` is a writable store, you can also bind the data properties to your inputs instead of using the `form` action.

```html
<script>
  import { createForm } from 'felte'

  const { handleSubmit, data, errors } = createForm({
    initialValues: {
      email: '',
      password: '',
    },
    validate: (values) => {
      /* validate and return errors found */
    },
    onSubmit: async (values) => {
      /* call to an api */
    },
  })

  $: console.log($data)
  $: console.log($errors)
</script>

<form on:submit="{handleSubmit}">
  <input type=text bind:value="{$data.email}">
  <input type=password bind:value="{$data.password}">
  <input type=submit value="Sign in">
</form>
```

With this approach you should see a similar behaviour to the previous way of using this. Note that the `name` attribute is optional here, but the `initialValues` property for `createForm` is required. It is a bit more verbose, so it's recommended to use the previous way of handling forms.
