---
section: Validation
subsections:
  - Server errors
  - Error handling
  - Multiple validations
  - Warnings
---

## Validation

The `useForm` function can also accept a validation function. It's a function that accepts the current form values and needs to return an object with the same shape, but instead of the property values it can have a string or array of strings containing the validation messages.

```javascript
const { form } = useForm({
  // ...
  validate: (values) => {
    const errors = {}
    if (!values.email || !/^[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+/.test(values.email)) {
      errors.email = 'Must be a valid email';
    }
    if (!values.password) errors.password = [
      'Must not be empty',
      'Must be over 8 characters',
    ];
    if (values.password && values.password.length < 8) {
      errors.password = ['Must be over 8 characters'];
    }
    return errors;
  },
  // ...
});
```

It shouldn't be a hard task to use a third party library, as long as you transform their result into something that Felte understands.

> Note that the `validate` function **can be asynchronous**.

Felte will validate whichever field it considers as `touched` as you fill the form, and it will validate all fields (and set them as `touched`) when submitting it.

### Server errors

You can add an `onError` function to the `useForm` configuration that will be called if the `onSubmit` function throws an error. It will be called with the value thrown from the `onSubmit` function, or with an instance of `FelteSubmitError` if using Felte's default submit handler. You can use the `onError` function to shape your server errors into the same shape that the `validate` function expects and return them from the same function for them to be handled.

```javascript
const { form } = useForm({
  // ...
  // Assuming your server already returns them with the appropriate shape.
  // Might not be the case for most cases.
  onError: (errors) => errors,
  // ...
});
```

### Error handling

`useForm` returns also its `errors` and `touched` fields as accessors.

```tsx
import { useForm } from '@felte/react';

export function Form() {
  const { form, errors, touched } = useForm({ \*...*\ });

  return (
    <>
      {/* ... */}
      <pre>
        {/* Prettify the errors and display them in HTML */}
        {JSON.stringify(errors(), null, 2)}
      </pre>
      <pre>
        {JSON.stringify(touched(), null, 2)}
      </pre>
      {/* ... */}
    </>
  );
}
```

You can read more above them in the [stores](/docs/react/stores) section.

You don't need to manually handle this errors. Felte provides four official packages to handle your errors for you, either using Tippy, directly mutating the DOM, providing a React component or using the browser's built-in constraint validation API. You can read more about this in the [reporters](/docs/react/reporters) section.

### Multiple validations

The `validate` property of the configuration object can also be an array of validation functions. The resulting errors from running each validation function will be merged into a single object. If a single property was assigned two or more errors from the validation functions, the property will be an array of strings. This might not be useful for common scenarios, but it will come useful when using any of our [validator packages](/docs/react/validators).

### Warnings

Sometimes you may want to display certain validation messages that _do not_ prevent the form from submitting, such as a password security message. Felte provides a store called `warnings` for this, and such warnings can be added to the store by using the `warn` property on `useForm`'s configuration.

```javascript
const { form } = useForm({
  // ...
  warn: (values) => {
    const warnings = {}
    if (values.password && values.password.length < 8) {
      warnings.password = 'Your password could be more secure';
    }
    return warnings;
  },
  // ...
});
```

The `warn` function works exactly the same as the `validate` function. With the same features and constraints. Multiple warn functions can be passed as an array, and the shape of `warnings` can contain either a string or an array of strings.
