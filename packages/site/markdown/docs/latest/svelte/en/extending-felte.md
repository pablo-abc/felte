---
section: Extending Felte
---

## Extending Felte

> **NOTE**: This API is not set in stone yet. It is open for change on feedback or future needs.
>
> If you're a package author and this API is missing any feature, please do [open an issue](https://github.com/pablo-abc/felte/issues) or [make a pull request](https://github.com/pablo-abc/felte/pulls).

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
  config,
  addValidator,
  addWarnValidator,
  addTransformer,
  setFields,
  validate,
  reset,
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

- `form` refers to the [HTMLFormElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormElement) of the form you're handling. The first time the extender is called, this will be `undefined`. Whenever the `form` action is called (and on any subsequent call) this will contain the appropriate element.
- `controls` refer to the the form controls of the form that are handled by Felte. The first time the extender is called, this will be `undefined`. Whenever the `form` action is called (and on any subsequent call) this will contain the appropriate elements.
- `stage` is a string that denotes the current stage of the form. Possible values: `'SETUP'`, `'MOUNT'` and `'UPDATE'`.
- `data` is an observable that contains the values of the form.
- `errors` is an observable that contains the errors of the form.
- `warnings` is an observable that contains the warnings of the form.
- `touched` is an observable that contains the touched values of the form.
- `config` is the configuration object passed by the user to `createForm`.
- `addValidator` is a function that accepts a validation function to add to the user's `validate` configuration.
- `addWarnValidator` is a function that accepts a validation function to add to the user's `warn` configuration.
- `addTransformer` is a function that accepts a transform function to add to the user's `transform` configuration.
- `setFields` is the same setter described in the [Helper functions section](/docs/svelte/helper-functions#setters).
- `validate` is the same helper described in the [Helper functions section](/docs/svelte/helper-functions#validate).
- `reset` is the same helper described in the [Helper functions section](/docs/svelte/helper-functions#reset).

If you're subscribing to any store, or adding any event listeners in the extender, you will want to unsubscribe and/or remove any event listeners in the `destroy` function that you can return from the extender. If you're not using any events or subscribing to any store, you don't need to set this.

If you want to perform an action whenever there are errors on a `submit` event (e.g. server validation), you can handle them in the `onSubmitError` function. This will receive the current values contained in the `errors` store.

You may check [Felte's repo](https://github.com/pablo-abc/felte) and go over any validator or reporter source code. You'll find they're quite simple.

> **NOTE**: If you check the `validator` packages you'll notice that you **can** change the signature of the configuration object for `createForm` in order for it to be used by your extender.
