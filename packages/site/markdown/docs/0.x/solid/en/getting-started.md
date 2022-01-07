---
section: Getting started
---

## Getting started

Felte is a JavaScript library that tries to help you ease the management of forms, form validation and the reporting of validation errors. To use its basic functionalities you'll only need the base `@felte/solid` package from npm.

```sh
npm i -S @felte/solid

# Or if you use yarn

yarn add @felte/solid
```

Then, inside of the Solid component where you have your form, import the `createForm` function and call it with a configuration object containing an `onSubmit` function. The `createForm` function returns a function that you can use in any form as a directive or passing it to `ref`. This is all you need to make your form reactive.

```tsx
import { createForm } from '@felte/solid';

export function Form() {
  const { form } = createForm({
    onSubmit: (values) => {
      // ...
    },
  });

  return (
    <form use:form>
      <input type="text" name="email" />
      <input type="password" name="password" />
      <input type="submit" value="Sign in" />
    </form>
  );
}
```

Felte does not export any components like `Form`, `Field` or anything like that, but you do need to make felte aware of your inputs by assigning a **name** to them.

Felte also offers [validation handling](/docs/solid/validation) and [error reporting](/docs/solid/reporters) but this is all you need for the most basic, validation-less form.
