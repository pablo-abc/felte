---
section: Getting started
---

## Getting started

Felte is a JavaScript library that tries to help you ease the management of forms, form validation and the reporting of validation errors. To use its basic functionalities you'll only need the base `felte` package from npm.

```sh
npm i -S felte
```
If you use pnpm:

```sh
pnpm add felte
```

If you use yarn:

```sh
yarn add felte
```

Then, inside of the Svelte component where you have your form, import the `createForm` function and call it with a configuration object containing an `onSubmit` function. The `createForm` function returns an action that you can use in any form. This is all you need to make your form reactive.

```svelte
<script>
  import { createForm } from 'felte';

  const { form } = createForm({
    onSubmit: (values) => {
      // ...
    },
  })
</script>

<form use:form>
  <input type="text" name="email">
  <input type="password" name="password">
  <button type="submit">Sign In</button>
</form>
```

The `onSubmit` handler is actually optional. If no handler is provided, Felte will send a request using `fetch` with the `action`, `method` and `enctype` attributes of your `form` element. It will send the request as `multipart/form-data` if you specify it with the `enctype` (which you should do if your form contains an `<input type=file>`), or `application/x-www-form-urlencoded`.

```svelte
<script>
  import { createForm } from 'felte';

  const { form } = createForm();
</script>

<form use:form action="/example" method="post">
  <input type="text" name="email">
  <input type="password" name="password">
  <button type="submit">Sign In</button>
</form>
```

> You can read more about the different ways to submit your forms in the [submitting section](/docs/svelte/submitting).

Felte does not export any components like `Form`, `Field` or anything like that, but you do need to make felte aware of your inputs by assigning a **name** to them.

Felte also offers [validation handling](/docs/svelte/validation) and [error reporting](/docs/svelte/reporters) but this is all you need for the most basic, validation-less form.
