---
section: Configuration reference
---

## Configuration reference

Felte's `createForm` function accepts a configuration object with the following properties:

- **onSubmit**: (See [Submitting](/docs/element/submitting#custom-handler)) a function that receives as a first argument the submitted data, and as a second argument a `context` object with the following properties:
  - **form**: the native HTML form element.
  - **event**: the event that'd be dispatched to an event handler when submitting a form.
  - **controls**: the form's native HTML controls.
  - **config**: the current configuration of the form.
- **validate**: a validation function (or array of functions) that receives the data to validate and returns an `errors` object, or `undefined` if the data is valid. The validation functions may be asynchronous. See [Validation](/docs/element/validation).
- **warn**: a validation function (or array of functions) that receives the data to validate and returns an object with the same shape as `data`, but with warning messages or `undefined` as values. It can be an array of functions whose validation errors will be merged. See [Validation](/docs/element/validation#warnings).
- **transform**: a transformation function (or array of functions) that receives the data coming from your form and returns a `data` object. See [Transformations](/docs/element/transformations).
- **onSuccess**: a function that receives anything returned from the `onSubmit` function, or the `Response` object from `fetch` if no `onSubmit` function is provided. Useful for reacting when a form is succesfully submitted.
- **onError**: a function that receives any unhandled errors thrown in the `onSubmit` function, or an instance of `FelteSubmitError` if no `onSubmit` handler is provided. Useful for handling [server errors](/docs/element/validation#server-errors).
- **extend**: an extender or array of extenders. Currently these are either [validators](/docs/element/validators) or [reporters](/docs/element/reporters). Note that extenders may add/change this same configuration object. Check their documentation when adding one.
- **debounced**: (See [Validation](/docs/element/validation#debounced-validations)) an object that contains the validations you'd like to be debounced (executed a certain amount of time after the user stops interacting with your form). It contain the following properties:
  - **validate**: the same as the `validate` function described above.
  - **warn**: the same as the `warn` function described above.
  - **timeout**: time in milliseconds to wait after the user stops interacting with your form before running the validation functions. Defaults to 300.
  - **validateTimeout**: time in milliseconds that overrides the value of `timeout` for your `validate` functions.
  - **warnTimeout**: time in milliseconds that overrides the value of `timeout` for your `warn` functions.

> Every property is optional.
