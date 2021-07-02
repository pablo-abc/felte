---
section: Helper functions
subsections:
  - setField
  - setFields
  - setTouched
  - setError
  - validate
  - reset
  - createSubmitHandler
---

## Helper functions

The `createForm` function also returns some additional helpers that can help with some more complex use cases.

### setField

A function that accepts a `string` path for the `data` store, the value to be set and an optional boolean argument defining if this operation should _touch_ the field (defaults to `true`).

### setFields

A function that accepts an object with the same shape as your data, it will set this data to your `data` store as well as to every field of the form.

### setTouched

A function that accepts a `string` path for the `touched` store that sets a field to `touched`.

### setError

A function that accepts a `string` path for the `errors` store that sets an error.

### validate

A function that forces Felte to validate all inputs, touches all of them and updates the `errors` store. It has no arguments.

### reset

A function that resets all inputs and the `data` store to its original values. It has no arguments.

### createSubmitHandler

A function that creates a submit handler with overriden `onSubmit`, `onError` and/or `validate` functions. If nothing is passed as a first argument, or if any of the three accepted properties is undefined, it will use the values from the `createForm` configuration object as a default.

```html
<script>
  const { form, createSubmitHandler } = createForm({
    onSubmit: (values) => console.log('Default onSubmit'),
  });

  const altOnSubmit = createSubmitHandler({
    onSubmit: (values) => console.log('Alternative onSubmit'),
    validate: (values) => /* ... */,
    onError: (errors) => /* ... */,
  });
</script>

<form use:form>
  <input type="email" name="email">
  <input type="password" name="password">
  <button type="submit">Call default submit handler</button>
  <button type="submit" on:click={altOnSubmit}>Call alternative submit handler</button>
</form>
```

> **NOTE**: The returned submit handler **can** be used outside of the `<form>` tag or be called programatically.
