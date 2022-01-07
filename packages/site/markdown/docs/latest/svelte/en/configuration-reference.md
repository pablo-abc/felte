---
section: Configuration reference
---

## Configuration reference

Felte's `createForm` function accepts a configuration object with the following properties:

- **onSubmit**: a function that receives as a first argument the submitted data, and as a second argument a `context` object with the following properties:
  - **form**: the native HTML form element.
  - **controls**: the form's native HTML controls.
  - **config**: the current configuration of the form.
- **validate**: a validation function (or array of functions) that receives the data to validate and returns an `errors` object, or `undefined` if the data is valid. The validation functions may be asynchronous. See [Validation](/docs/svelte/validation).
- **warn**: a validation function (or array of functions) that receives the data to validate and returns an object with the same shape as `data`, but with warning messages or `undefined` as values. It can be an array of functions whose validation errors will be merged. See [Validation](/docs/svelte/validation#warnings).
- **transform**: a transformation function (or array of functions) that receives the data coming from your form and returns a `data` object. See [Transformations](/docs/svelte/transformations).
- **onError**: a function that receives any unhandled errors thrown in the `onSubmit` function. Useful for handling [server errors](/docs/svelte/validation#server-errors).
- **extend**: an extender or array of extenders. Currently these are either [validators](/docs/svelte/validators) or [reporters](/docs/svelte/reporters). Note that extenders may add/change this same configuration object. Check their documentation when adding one.

> Every property is optional, except `onSubmit`.
