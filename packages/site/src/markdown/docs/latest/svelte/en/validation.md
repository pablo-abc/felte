---
section: Validation
subsections:
  - Server errors
  - Error handling
  - Multiple validations
  - Warnings
  - Async validations
  - Debounced validations
---

## Validation

The `createForm` function can also accept a validation function. It's a function that accepts the current form values and needs to return an object with the same shape, but instead of the property values it can have a string or array of strings containing the validation messages.

```javascript
const { form } = createForm({
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

You can add an `onError` function to the `createForm` configuration that will be called if the `onSubmit` function throws an error. It will be called with the value thrown from the `onSubmit` function, or with an instance of `FelteSubmitError` if using Felte's default submit handler. You can use the `onError` function to shape your server errors into the same shape that the `validate` function expects and return them from the same function to update your `errors` store with them.

```javascript
const { form } = createForm({
  // ...
  // Assuming your server already returns them with the appropriate shape.
  // Might not be the case for most cases.
  onError: (errors) => errors,
  // ...
});
```

Alternatively, you can capture the `felteerror` custom event from your `form` element. You'd need to update your `errors` store manually if you use this.

### Error handling

`createForm` returns also its `errors` and `touched` fields as stores.

```svelte
<script>
  import { createForm } from 'felte';

  const { form, errors, touched } = createForm({ \*...*\ });
</script>

<pre>
  <!-- Prettify the errors and display them in HTML -->
  {JSON.stringify($errors, null, 2)}
</pre>

<pre>
  {JSON.stringify($touched, null, 2)}
</pre>
```

You can read more above them in the [stores](/docs/svelte/stores) section.

You don't need to manually handle this errors. Felte provides four official packages to handle your errors for you, either using Tippy, directly mutating the DOM, providing a Svelte component or using the browser's built-in constraint validation API. You can read more about this in the [reporters](/docs/svelte/reporters) section.

### Multiple validations

The `validate` property of the configuration object can also be an array of validation functions. The resulting errors from running each validation function will be merged into a single object. If a single property was assigned two or more errors from the validation functions, the property will be an array of strings. This might not be useful for common scenarios, but it will come useful when using any of our [validator packages](/docs/svelte/validators).

### Warnings

Sometimes you may want to display certain validation messages that _do not_ prevent the form from submitting, such as a password security message. Felte provides a store called `warnings` for this, and such warnings can be added to the store by using the `warn` property on `createForm`'s configuration.

```javascript
const { form } = createForm({
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

### Async validations

Felte supports asynchronous validations by default by returning a promise from your validation functions, either for warnings or errors. Felte takes care of possible race conditions by ignoring the results of previous async validations if it's executed again before the previous one finishes.

```javascript
const { form } = createForm({
  // ...
  validate: async (values) => {
    const response = await someAsyncAction(values);
    // Do something with the response and return the errors
  },
  // ...
});
```

Validations execute at every keypress, so make sure to not execute anything you don't want to spam. For these kinds of actions, Felte also supports for your validations to be debounced.

### Debounced validations

If your validation shouldn't be called for every keypress of the user, such as an expensive synchronous validation or an API call, Felte can debounce said validations for you. These validations should be added within the `debounced` property of Felte's configuration:

```javascript
const { form } = createForm({
  // ...
  debounced: {
    // defaults to 300
    timeout: 300,
    validate: async (values) => {
      const response = await someFetchCall(values);
      // Do something with the response and return the errors
    },
    warn: async (values) => {
      const response = await someOtherFetchCall(values);
      // Do something with the response and return the warnings
    },
  },
  // ...
});
```

The `debounced` object accepts the following properties:

* `validate` one or more validation funcions, the same as the regular `validate` property.
* `warn` one or more validation funcions, the same as the regular `validate` property.
* `timeout` optional time in milliseconds to wait before running validations after the user stops interacting with the form. Defaults to 300ms.
* `validateTimeout` optional time in milliseconds that overrides the value of `timeout` for the `validate` functions.
* `warnTimeout` optional time in milliseconds that overrides the value of `timeout` for the `warn` functions.
