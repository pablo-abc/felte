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
---

## Stores

Felte's `createForm` returns the stores it uses to handle your form. These stores are `data`, `errors` and `touched`.

### data

A writable store that contains the form's values. Depending on the field type, the values can be either a `string`, an array of `string`s, a `number`, a `boolean`, a `File`, an array of `File`s or `undefined` if no value has been set.

### errors

A writable store that contains the validation errors in the form. It will have the same shape as `data` but containing either a `string` or an array of `string`s with each validation message per field.

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
