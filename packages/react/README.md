# @felte/react

[![Bundle size](https://img.shields.io/bundlephobia/min/@felte/react)](https://bundlephobia.com/result?p=@felte/react)
[![NPM Version](https://img.shields.io/npm/v/@felte/react)](https://www.npmjs.com/package/@felte/react)

Felte is an extensible form library originally built for Svelte but easily integrated with React using this package. Felte, on its most simple form, only requires you to set a `ref` to your form element to work. No custom `Field`or `Form` components are needed, making custom styles really easy to do.

**STATUS**: Perfectly useable, although since we are still pre 1.0.0 there might be some breaking changes between minor versions. It's recommended to keep your versions pinned and check changelogs when upgrading a minor version. It should be compatible with every other extender except the one's specifically made for a framework.

## Features

- Single action to make your form reactive.
- Use HTML5 native elements to create your form. (Only the `name` attribute is necessary).
- No re-renders at all unless you need to use a specific field's value within your component.
- Provides stores and helper functions to handle more complex use cases.
- No assumptions on your validation strategy. Use any validation library you want or write your own strategy.
- Handles addition and removal of form controls during runtime.
- Official solutions for error reporting using `reporter` packages.
- Well tested. Currently at [99% code coverage](https://app.codecov.io/gh/pablo-abc/felte) and constantly working on improving test quality.
- Supports validation with [yup](./packages/validator-yup/README.md), [zod](./packages/validator-zod/README.md) and [superstruct](./packages/validator-superstruct/README.md).
- Easily [extend its functionality](https://felte.dev/docs/react/extending-felte).

## Simple ussage example

```jsx
import React, { useEffect } from 'react';
import { useForm } from '@felte/react';

function Form() {
  const { form } = useForm({
    onSubmit: (values) => console.log(values),
  });

  return (
    <form ref={form}>
      <input name="email" />
      <input name="password" type="password" />
      <button type="submit">Submit</button>
    </form>
  );
}
```

## Installation

```sh
npm install --save @felte/react

# Or, if you use yarn

yarn add @felte/react
```

## Usage

Felte exports a hook called `useForm` that accepts a configuration object with the following interface:

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
- `validate` is a custom validation function that must return an object with the same shape as `data`, but with error messages or `undefined` as values. It can be an array of functions whose validation errors will be merged.
- `warn` is a custom validation function that must return an object with the same shape as `data`, but with warning messages or `undefined` as values. It can be an array of functions whose validation errors will be merged.
- `onSubmit` is the function that will be executed when the form is submited.
- `onError` is a an optional function that will run if the submit throws an exception. It will contain the error catched. If you return an object with the same shape as `Errors`, these errors can be reported by a reporter.
- `extend` a function or list of functions to extend Felte's behaviour. Currently it can be used to add `reporters` to Felte, these can handle error reporting for you. You can read more about them in [Felte's documentation](https://felte.dev/docs/react/reporters).

When `useForm` is called it returns an object with everything you'll need to handle your forms. The most important property from this object is `form` which is a function that you'll need to pass as a `ref` to your `form` element. This is all you need in most cases for Felte to keep track of your form's state as lon as your fields are using native HTML input/select/textarea elements with a `name` attribute. The simple usage example shown previously showcases its use.

Since all the data is handled within Felte, in a best case scenario, using this package to handle your forms won't trigger _any_ component re-renders at all unless necessary. For example, if you need the value of a field, error or warning within a component. For this, Felte's `useForm` also returns accessors to the values, warnings, errors, and other information of the store. These are used as functions that optionally accept a path or selector function to retrieve a specific property of the stores that contain objects Using selectors/paths would make it so your component _only_ re-renders when the property selected changes. E.g. let's say we have a sign-in form and we need to use the value of the `email` field of your form for some reason:

```jsx
import { useEffect } from 'react';
import { useForm } from '@felte/react';

function Form() {
  const { data, form } = useForm({ onSubmit: console.log });

  // We subscribe ONLY to the `email`, re-renders are not trigger if any other
  // value changes.
  // The accessor also accepts a string path as a second argument,
  // but this is not type-safe if using TypeScript.
  const email = data(($data) => $data.email);

  useEffect(() => {
    console.log(email);
  }, [email]);

  return (
    <form ref={form}>
      <input name="email" />
      <input name="password" type="password" />
      <button type="submit">Submit</button>
    </form>
  )
}
```

These `accessors` are _NOT_ hooks, so feel free to call them wherever you want in your component. Even within your JSX! If using a selector, you can even use it to obtain derived values:

```jsx
import { useEffect } from 'react';
import { useForm } from '@felte/react';

function Form() {
  const { data, form } = useForm({
    // We set initial values so they're not `undefined` on initialization.
    initialValues: { email: '', password: '' },
    onSubmit: console.log,
  });

  return (
    <form ref={form}>
      <input name="email" />
      <input name="password" type="password" />
      {/* The component will only re-render when the length of the password changes */}
      <span>Your password is {data(($data) => $data.password.length)} characters long</span>
      <button type="submit">Submit</button>
    </form>
  )
}
```

Needing these subscription should be unnecessary in most cases, since most use-cases should be able to be done within Felte, such as validation and submission of your form values.

#### Nested forms

Felte supports the usage of nested objects for forms by setting the name of an input to the format of `object.prop`. It supports multiple levels. The behaviour is the same as previously explained, taking the default values from the `value` and/or `checked` attributes when appropriate.

```html
<form ref={form}>
  <input name="account.email" />
  <input name="account.password" />
  <input name="profile.firstName" />
  <input name="profile.lastName" />
  <input type="submit" value="Create account" />
</form>
```

You can also "namespace" the inputs using the `fieldset` tag like this:

```html
<form ref={form}>
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
<form ref={form}>
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
