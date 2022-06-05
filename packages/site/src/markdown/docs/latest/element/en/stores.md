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

Felte keeps stores internally to keep track of all of your data, their current values are available through properties on the `<felte-form>` element. You can react to changes to said stores by using event handlers or assigning a function to some of the elements properties (such as `onDataChange` for the `data` store).

### data

An store that contains the form's values. Depending on the field type, the values can be either a `string`, an array of `string`s, a `number`, a `boolean`, a `File`, an array of `File`s or `undefined` if no value has been set.

As described above, we can obtain the value of the whole store by calling `data()`, or a specific field by passing a string path or selector function. E.g. if the store had an `email` property, we could access it either like `data('email')` or `data(($data) => $data.email)`.

As described above, you can react to the changes to this store via events or assigning a function to a property of the element.

- **Method**: `.onDataChange`
- **Event**: `datachange`

```javascript
const felteForm = document.querySelector('felte-form');

felteForm.onDataChange = () => {
  // Reacting to changes on `data` using a function.
  console.log(felteForm.data);
};

felteForm.addEventListener('datachange', (event) => {
  // Reacting to changes on `data` using events
  console.log(event.currentTarget.data);
  // Equivalent to the previous `console.log`
  console.log(felteForm.data);
});
```

All other stores can be handled in a similar way.

### errors

A store that contains the validation errors in the form. It will have the same shape as `data` but containing either `null` if there's no errors, or an array of strings if there are.

- **Method**: `.onErrorsChange`
- **Event**: `errorschange`

### warnings

A store that contains warnings on the form fields set by the `warn` function. Unlike the `errors` store, this store will have validation messages immediately and not only when a field is touched.

- **Method**: `.onWarningsChange`
- **Event**: `warningschange`

### touched

A store with the same shape as `data` but containing `boolean`s as values, defining if the field has been touched or not.

- **Property**: `.touched`
- **Method**: `.onTouchedChange`
- **Event**: `touchedchange`

### isValid

A store containing a single boolean that tells if the form is valid or not.

- **Method**: `.onIsValidChange`
- **Event**: `isvalidchange`

### isSubmitting

A store containing a single boolean that tells if the form is submitting or not.

- **Method**: `.onIsSubmittingChange`
- **Event**: `issubmittingchange`

### isDirty

A store containing a single boolean that tells if the form is dirty or not.

- **Method**: `.onIsDirtyChange`
- **Event**: `isdirtychange`

### isValidating

A store containing a single boolean that tells if the form is currently validating. Useful to know if an async or debounced validation is running.

- **Method**: `.onIsValidatingChange`
- **Event**: `isvalidatingchange`

### interacted

A store containing either `null` or the name of the field the user last interacted with as a `string`. Note that this only updates on user events triggered from native fields or fields created using `createField`. Its value gets reset to `null` on form submission, calls to `validate` and calls to `reset`.

- **Method**: `.onInteractedChange`
- **Event**: `interactedchange`
