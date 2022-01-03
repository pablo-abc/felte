---
section: Getting started
---

## Getting started

Felte is a JavaScript library that tries to help you ease the management of forms, form validation and the reporting of validation errors. To use its basic functionalities you'll only need the base `@felte/react` package from npm.

```sh
npm i -S @felte/react

# Or if you use yarn

yarn add @felte/react
```

Then, inside of the React component where you have your form, import the `createForm` function and call it with a configuration object containing an `onSubmit` function. The `createForm` function returns a function that you can use in any form as a `ref` to the HTML form element. This is all you need to make Felte track your form.

```tsx
import { createForm } from '@felte/react';

export function Form() {
  const { form } = createForm({
    onSubmit: (values) => {
      // ...
    },
  });

  return (
    <form ref={form}>
      <input type="text" name="email" />
      <input type="password" name="password" />
      <input type="submit" value="Sign in" />
    </form>
  );
}
```

Felte does not export any components like `Form`, `Field` or anything like that, but you do need to make felte aware of your inputs by assigning a **name** to them.

In its most basic form (such as the previous example), using Felte does not trigger any re-renders at all.

Felte also offers [validation handling](/docs/react/validation) and [error reporting](/docs/react/reporters) but this is all you need for the most basic, validation-less form.
