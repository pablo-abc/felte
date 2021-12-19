# @felte/solid

[![Bundle size](https://img.shields.io/bundlephobia/min/@felte/solid)](https://bundlephobia.com/result?p=@felte/solid)
[![NPM Version](https://img.shields.io/npm/v/@felte/solid)](https://www.npmjs.com/package/@felte/solid)


Felte is a simple to use form library originally built for Svelte but only needing minor modifications to work well with Solid. For Solid its functionality is based on the `use` directive. No `Field` or `Form` components, just plain stores and directives to build your form however you like. You can see it in action in this [CodeSandbox demo](https://codesandbox.io/s/felte-demo-solidjs-w92uj?file=/src/main.tsx)!

**STATUS:** Useable but expect some issues. Since we're reusing Felte's core but exchanging Svelte stores for Solid stores, everything should work as expected but further testing might be needed to guarantee this. It should be compatible with every extender package for Felte, except `@felte/reporter-svelte` for obvious reasons.

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

```jsx
import { createForm } from '@felte/solid';

const Form = () => {
  const { form } = createForm({
    // ...
    onSubmit: (values) => console.log(values),
    // ...
  });
  return (
    <form use:form>
      <input type="text" name="email" />
      <input type="password" name="password" />
      <input type="submit" value="Sign in" />
    </form>
  )
}
```

## Installation

```sh
npm install --save @felte/solid

# Or, if you use yarn

yarn add @felte/solid
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
  warn?: ValidationFunction<Data> | ValidationFunction<Data>[];
  onSubmit: (values: D, context: SubmitContext) => void;
  onError?: (errors: unknown) => void | Errors<D>;
  extend?: Extender | Extender[];
}
```

- `initialValues` refers to the initial values of the form.
- `validate` is a custom validation function that must return an object with the same props as initialValues, but with error messages or `undefined` as values. It can be an array of functions whose validation errors will be merged.
- `warn` is a custom validation function that must return an object with the same props as initialValues, but with warning messages or `undefined` as values. It can be an array of functions whose validation errors will be merged.
- `onSubmit` is the function that will be executed when the form is submited.
- `onError` is a an optional function that will run if the submit throws an exception. It will contain the error catched. If you return an object with the same shape as `Errors`, these errors can be reported by a reporter.
- `extend` a function or list of functions to extend Felte's behaviour. Currently it can be used to add `reporters` to Felte, these can handle error reporting for you. You can read more about them in [Felte's documentation](https://felte.dev/docs#reporters).

When called, `createForm` will return an object with the following interface:

```typescript
type FormAction = (node: HTMLFormElement) => { destroy: () => void };
type FieldValue = string | string[] | boolean | number | File | File[];
type CreateSubmitHandlerConfig<D> = {
  onSubmit: (values: D) => void;
  validate?: ValidationFunction<Data> | ValidationFunction<Data>[];
  warn?: ValidationFunction<Data> | ValidationFunction<Data>[];
  onError: (errors: unknown) => void | Errors<D>;
}

export interface Form<D extends Record<string, unknown>> {
  form: FormAction;
  data: Store<Data>;
  errors: Store<Errors<Data>>;
  warnings: Store<Errors<D>>;
  touched: Store<Touched<Data>>;
  isSubmitting: Accessor<boolean>;
  isValid: Accessor<boolean>;
  isDirty: Accessor<boolean>;
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

- `form` is a function to be used with the `use:` directive for Solid.
- `data` is a Solid readonly store with the current values from the form.
- `errors` is a Solid readonly store with the current errors.
- `warnings`is a Solid readonly store with warnings set from the `warn` function.
- `touched` is a Solid readonly store that defines if the fields have been touched. It's an object with the same keys as data, but with boolean values.
- `handleSubmit` is the event handler to be passed to `on:submit`.
- `isValid` is a Solid signal that only holds a boolean denoting if the form has any errors or not.
- `isSubmitting` is a Solid signal that only holds a boolean denoting if the form is submitting or not.
- `isDirty` is a Solid signal that only holds a boolean denoting if the form is dirty or not.
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

```jsx
import { createForm } from '@felte/solid'
// install with `yarn add @felte/reporter-tippy`
import reporter from '@felte/reporter-tippy'

const Form = () => {
  const { form, data, errors } = createForm({
    validate: (values) => {
      /* validate and return errors found */
    },
    onSubmit: async (values) => {
      /* call to an api */
    },
    /* extends Felte to report errors with Tippy.js */
    extend: reporter,
  })

  return (
    <form use:form>
      <input type="text" name="email" />
      <input type="password" name="password" />
      <input type="submit" value="Sign in" />
    </form>
  );
}
```

That's all you need! With the example above you'll see **Felte** automatically updating the values of `data` when you type, as well as `errors` when finding an error. Note that the only required property for `createForm` is `onSubmit`.

Also note that using the `data` and `errors` store is completely optional in this method, since you already get access to the values of the form in the `onSubmit` function, and validation errors are reported with the browser's Constraint Validation API by using the `@felte/reporter-cvapi` package.

> Make sure to set the `name` attributes of your inputs since that is what Felte uses to map to the `data` store.

> Since Solid does not favor two-way data binding, `@felte/solid` does not provide this approach in this case.

#### Nested forms

Felte supports the usage of nested objects for forms by setting the name of an input to the format of `object.prop`. It supports multiple levels. The behaviour is the same as previously explained, taking the default values from the `value` and/or `checked` attributes when appropriate.

```html
<form use:form>
  <input name="account.email" />
  <input name="account.password" />
  <input name="profile.firstName" />
  <input name="profile.lastName" />
  <input type="submit" value="Create account" />
</form>
```

You can also "namespace" the inputs using the `fieldset` tag like this:

```html
<form use:form>
  <fieldset name="account">
    <input name="email" />
    <input name="password" />
  </fieldset>
  <fieldset name="profile">
    <input name="firstName" />
    <input name="lastName" />
  </fieldset>
  <input type="submit" value="Create account" />
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

#### Dynamic forms

You can freely add/remove fields from the form and Felte will handle it.

```html
<form use:form>
  <fieldset name="account">
    <input name="email">
    <input name="password">
  </fieldset>
  <Show when={condition()}>
    <fieldset name="profile" data-felte-unset-on-remove=true>
      <input name="firstName">
      <input name="lastName" data-felte-unset-on-remove=false>
    </fieldset>
  </Show>
  <input type="submit" value="Create account">
</form>
```

The `data-felte-unset-on-remove=true` tells Felte to remove the property from the data object when the HTML element is removed from the DOM. By default this is false. If you do not set this attribute to `true`, the properties from the removed elements will remain in the data object untouched.

You can set the `data-felte-unset-on-remove=true` attribute to a `fieldset` element and all the elements contained within the fieldset will be unset on removal of the node, unless any element within the fieldset element have `data-felte-unset-on-remove` set to false.

> Felte takes any value that is not `true` as `false` on the `data-felte-unset-on-remove` attribute.
