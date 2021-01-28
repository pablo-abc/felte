# Felte: A form library for Svelte

Felte is a simple to use form library for Svelte. It is based on Svelte stores nd Selte actions for its functionality. No `Field` or `Form` components, just plain stores and actions to build your form however you like.

## Instalation

```sh
npm install --save felte

# Or if you use yarn

yarn add felte
```

## Usage

Felte exports a single `createForm` function that accepts a config object with the following interface:

```typescript
interface FormConfig<D extends Record<string, unknown>, R = D> {
  initialValues?: D;
  validate?: (values: D) => Errors<D>;
  onSubmit: (values: D) => void;
}
```

- `initialValues` refers to the initial values of the form.
- `validate` is a custom validation function that must return an object with the same props as initialValues, but with error messages or `undefined` as values.
- `onSubmit` is the function that will be executed when the form is submited.

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

> If using Felte this way, make sure to set the `name` attributes of your inputs since that is what Felte uses to map to the `data` store.

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
