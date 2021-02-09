# Felte: A form library for Svelte

![Tests](https://github.com/pablo-abc/felte/workflows/Tests/badge.svg)
![Bundle size](https://img.shields.io/bundlephobia/min/felte)
![Version](https://img.shields.io/github/package-json/v/pablo-abc/felte)
![NPM Version](https://img.shields.io/npm/v/felte)

Felte is a simple to use form library for Svelte. It is based on Svelte stores nd Selte actions for its functionality. No `Field` or `Form` components, just plain stores and actions to build your form however you like. You can see it in actino in this [CodeSandbox demo](https://codesandbox.io/s/felte-demo-wce2h?file=/App.svelte)!


## Why

I felt that Svelte would allow to create a simple, almost configuration-less way to handle forms. Current libraries (at least that I have found) still make forms feel reliant on a lot of configuration, or custom Field and Form components which make it a little bit harder to customize styles. I wanted a library that would feel as simple as possible to make a form reactive, without relying on custom components, to make styling and handling forms as simple as possible. TypeScript is also a big plus.

In order to accomplish usage as simple as possible, Felte takes advantage of Svelte actions to be able to make a form reactive using only the `use` directive. Felte also has built-in error reporting capabilities by using the browser's Constraint Validation API. This means you can use the `:valid` and `:invalid` pseudo-classes to style your components and do not need to worry about reporting errors as long as you return appropriate messages from the `validate` function.

## Installation

```sh
npm install --save felte

# Or if you use yarn

yarn add felte
```

## Usage

Felte exports a single `createForm` function that accepts a config object with the following interface:

```typescript
interface FormConfig<D extends Record<string, unknown>> {
  initialValues?: D;
  validate?: (values: D) => Errors<D>;
  onSubmit: (values: D) => void;
  onError?: (errors: unknown) => void;
  useConstraintApi?: boolean;
}
```

- `initialValues` refers to the initial values of the form.
- `validate` is a custom validation function that must return an object with the same props as initialValues, but with error messages or `undefined` as values.
- `onSubmit` is the function that will be executed when the form is submited.
- `onError` is a function that will run if the submit throws an exception. It will contain the error catched. This is optional and potential exceptions might as well be handled inside the `onSubmit` function.
- `useConstraintApi` this tells **Felte** to use or not use the browser's Constraint Validation API to the report errors found in the `validate` function. By default it is `false`.

When called, `createForm` will return an object with the following interface:

```typescript
type FormAction = (node: HTMLFormElement) => { destroy: () => void };

export interface Form<D extends Record<string, unknown>> {
  form: FormAction;
  data: Writable<D>;
  errors: Readable<Errors<D>>;
  touched: Writable<Touched<D>>;
  handleSubmit: (e: Event) => void;
  isValid: Readable<boolean>;
  isSubmitting: Writable<boolean>;
}
```

- `form` is a function to be used with the `use:` directive for Svelte.
- `data` is a writable store with the current values from the form.
- `errors` is a readable store with the current errors.
- `touched` is a readable store that defines if the fields have been touched. It's an object with the same keys as data, but with boolean values.
- `handleSubmit` is the event handler to be passed to `on:submit`.
- `isValid` is a readable store that only holds a boolean denoting if the form has any errors or not.
- `isSubmitting` is a writable store that only holds a boolean denoting if the form is submitting or not.

If a `validate` function is provided, Felte will add a `novalidate` to the form so it doesn't clash with the browser's built-in validations such as the ones resulting from `required`, `pattern` or due to types such as `email` or `url`. This is done on JavaScript's mount so the browser's validations will be run if JavaScript does not load. You may add these attributes anyway for accessibility purposes, and leaving them in may help you make these forms works even if JavaScript hasn't loaded yet. If a `validate` function is not defined, Felte will not interfere with the browser's validation.

### Using the form action

The recommended way to use it is by using the `form` action from `createForm` and using it in the form element of your form.

```html
<script>
  import { createForm } from 'felte'

  const { form, data, errors } = createForm({
    validate: (values) => {
      /* validate and return errors found */
    },
    onSubmit: async (values) => {
      /* call to an api */
    },
    useConstraintApi: true,
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

Also note that using the `data` and `errors` store is completely optional in this method, since you already get access to the values of the form in the `onSubmit` function, and validation errors are reported with the browser's Constraint Validation API by setting `useConstraintApi` to `true`.

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
    <fieldset name="profile" data-unset-on-remove=true>
      <input name="firstName">
      <input name="lastName" data-unset-on-remove=false>
    </fieldset>
  {/if}
  <input type="submit" value="Create account">
</form>
```

The `data-unset-on-remove=true` tells Felte to remove the property from the data object when the HTML element is removed from the DOM. By default this is false. If you do not set this attribute to `true`, the properties from the removed elements will remain in the data object untouched.

You can set the `data-unset-on-remove=true` attribute to a `fieldset` element and all the elements contained within the fieldset will be unset on removal of the node, unless any element within the fieldset element have `data-unset-on-remove` set to false.

> Felte takes any value that is not `true` as `false` on the `data-unset-on-remove` attribute.

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
