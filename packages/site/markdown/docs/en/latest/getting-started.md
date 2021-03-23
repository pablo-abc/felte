---
section: Getting started
---

## Getting started

Felte is a JavaScript library that tries to help you ease the management of forms, form validation and the reporting of validation errors. To use its basic functionalities you'll only need the base `felte` package from npm.

```sh
npm i -S felte

# Or if you use yarn

yarn add felte
```

Then, inside of the Svelte component where you have your form, import the `createForm` function and call it with an `onSubmit` action. The `createForm` function returns an action that you can use in any form. This is all you need to make your form reactive.

```html
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
  <input type="submit" value="Sign in">
</form>
```

Felte does not export any components for `Form` of `Field` or anything like that, but you need to make felte aware of your inputs by assigning a **name** to them.

Felte also offers valildation handling and error reporting but this is all you need for the most basic, validation-less form.
