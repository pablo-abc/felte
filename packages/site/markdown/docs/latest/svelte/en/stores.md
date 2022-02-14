---
section: Stores
subsections:
  - data
  - errors
  - warnings
  - touched
  - isValid
  - isSubmitting
  - isDirty
  - isValidating
  - interacted
---

## Stores

Felte's `createForm` returns the stores it uses to handle your form.

### data

A writable store that contains the form's values. Depending on the field type, the values can be either a `string`, an array of `string`s, a `number`, a `boolean`, a `File`, an array of `File`s or `undefined` if no value has been set.

### errors

A writable store that contains the validation errors in the form. It will have the same shape as `data` but containing either `null` if there's no errors, or an array of strings if there are.

### warnings

A store that contains warnings on the form fields set by the `warn` function. Unlike the `errors` store, this store will have validation messages immediately and not only when a field is touched.

### touched

A writable store with the same shape as `data` but containing `boolean`s as values, defining if the field has been touched or not.

### isValid

A readable store containing a single boolean that tells if the form is valid or not.

### isSubmitting

A readable store containing a single boolean that tells if the form is submitting or not.

### isDirty

A writable store containing a single boolean that tells if the form is dirty or not.

### isValidating

A readable store containing a single boolean that tells if the form is currently validating. Useful to know if an async or debounced validation is running.

### interacted

A writable store containing either `null` or the name of the field the user last interacted with as a `string`. Note that this only updates on user events triggered from native fields or fields created using `createField`. Its value gets reset to `null` on form submission, calls to `validate` and calls to `reset`.
