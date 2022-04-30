---
section: Extending Felte
---

## Extending Felte

You might have noticed that both `reporters` and `validators` make use of the `extend` property in the configuration for `createForm`. This is because both of these make use of Felte's extensibility. We will call any package that extends Felte an `extender` from now.

An `extender` is a simple function that gets called when `createForm` is called, when the `form` action is called and whenever the form changes.

```javascript
function extender({
  form,
  controls,
  stage,
  data,
  errors,
  warnings,
  touched,
  isValid,
  isValidating,
  isSubmitting,
  isDirty,
  interacted,
  config,
  addValidator,
  addTransformer,
  setFields,
  validate,
  reset,
  handleSubmit,
  createSubmitHandler,
}) {
  // ...
  return {
    destroy() {
      // ...
    },
    onSubmitError(errors) {
      // ...
    },
  }
}
```

- `form` refers to the [HTMLFormElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormElement) of the form you're handling. This is not available during the `SETUP` stage.
- `controls` refer to the the form controls of the form that are handled by Felte. This is not available during the `SETUP` stage.
- `stage` is a string that denotes the current stage of the form. Possible values: `'SETUP'`, `'MOUNT'` and `'UPDATE'`.
- `data` is an observable that contains the values of the form.
- `errors` is an observable that contains the errors of the form.
- `warnings` is an observable that contains the warnings of the form.
- `touched` is an observable that contains the touched values of the form.
- `isValid` is an observable that contains a boolean showing if the form is valid.
- `isValidating` is an observable that contains a boolean showing if validations are running.
- `isSubmitting` is an observable that contains a boolean showing if the form is submitting.
- `isDirty` is an observable that contains a boolean showing if the user has interacted with the form.
- `interacted` is an observable that contains either `null` or a string with the name of the last field the user interacted with.
- `config` is the configuration object passed by the user to `createForm`.
- `addValidator` is a function that accepts a validation function to add to the user's `validate` or `warn` configuration. Optionally accepts an object as second parameter with the following properties:
  - `debounce` is a boolean. If `true`, adds to debounced validators. Default: `false`.
  - `level` is either `"warning"` or `"error"`. Defines if the validator should be added to `warn` or `validate` respectively.
- `addTransformer` is a function that accepts a transform function to add to the user's `transform` configuration.
- `setFields` is the same setter described in the [Helper functions section](/docs/svelte/helper-functions#setters).
- `validate` is the same helper described in the [Helper functions section](/docs/svelte/helper-functions#validate).
- `reset` is the same helper described in the [Helper functions section](/docs/svelte/helper-functions#reset).
- `handleSubmit` is a function that triggers a form submission.
- `createSubmitHandler` is the same helper descriped in the [Helper functions section](/docs/svelte/helper-functions#createsubmithandler).

If you're subscribing to any store, or adding any event listeners in the extender, you will want to unsubscribe and/or remove any event listeners in the `destroy` function that you can return from the extender. If you're not using any events or subscribing to any store, you don't need to set this.

If you want to perform an action whenever there are errors on a `submit` event (e.g. server validation), you can handle them in the `onSubmitError` function. This will receive the current values contained in the `errors` store.

You may check [Felte's repo](https://github.com/pablo-abc/felte) and go over any validator or reporter source code. You'll find they're quite simple.

> **NOTE**: If you check the `validator` packages you'll notice that you **can** change the signature of the configuration object for `createForm` in order for it to be used by your extender.
