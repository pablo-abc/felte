---
section: Submitting
subsections:
  - Default handler
  - Custom handler
  - Context object
---

## Submitting

Felte offers two ways to submit your form data:

### Default handler

If no `onSubmit` function is provided on `createForm`, Felte will send a request using the following attributes from your `form` element:

* `action` will be the URL where the request will be sent.
* `method` will be the method used to send the request. This can only be `get` or `post` but you can override it by adding a `_method=VERB` query string to your `action`. Overriding only works if your `method` attribute is set to `post`.
* `enctype` is the MIME type that will be used to post your form data (if your `method` attribute has a value of `post`).

If the request succeeds, Felte will emit a `feltesuccess` event that you can handle on your `form` element. This is a `CustomEvent` that contains the `Response` from fetch in the `response` property of `detail`, merged with the `context` object described below.

If the request fails, Felte will emit a `felteerror` event that you can handle on your `form` element. This is a `CustomEvent` that contains an object with a `FelteSubmitError` instance in the `error` property of `detail`, merged with the `context` object described below.

> These events **do not** bubble.

```html
<script>
  import { createForm } from 'felte';

  const { form } = createForm();

  function handleSuccess(event) {
    const { response, ...context } = event.detail;
    // Do something with the response.
  }

  function handleError(event) {
    const { error, ...context } = event.detail;
    // `FelteSubmitError` contains a `response` property
    // with the response from `fetch`
    const response = error.response;
    // Do something with the error
  }
</script>

<form
  use:form
  action="/example"
  method="post"
  on:feltesuccess="{handleSuccess}"
  on:felteerror="{handleError}"
  >
  <input type="text" name="email">
  <input type="password" name="password">
  <button type="submit">Sign In</button>
</form>
```

Alternatively you can use the `onSuccess` and `onError` properties of `createForm`'s configuration for this. `onSuccess` will receive a `Response` object as a first argument. `onError` will receive an instance of `FelteSubmitError` as a first argument.

#### FelteSubmitError

When using the default handler, if the request fails Felte will throw a `FelteSubmitError`. This is a a JavaScript error that contains a `response` property which is the `Response` object from the `fetch` request. The class for `FelteSubmitError` is exported from this package to allow for comparisons with `instanceof`.

#### Fieldsets

When using this method for submitting form, you **can not** use the `name` attribute of a `fieldset` element to nest properties. Even though the `name` attribute is valid for a `fieldset` element, it is not used by the browser to submit data.

### Custom handler

`createForm` accepts an `onSubmit` function on its configuration object. If you set `onSubmit`, the default submit handler **wil not** run. Anything returned by this function will be passed as a first argument to `onSuccess`, and as the `detail` property of the `feltesuccess` custom event. Anything thrown from this function will be passed as a first argument to `onError`, and as the `detail` property of the `felteerror` custom event.

```html
<script>
  import { createForm } from 'felte';

  const { form } = createForm({
    onSubmit(values, context) {
      // ...
    },
    onSuccess(response, context) {
      // Do something with the returned value from `onSubmit`.
    },
    onError(err, context) {
      // Do something with the error thrown from `onSubmit`.
    },
  })
</script>

<form use:form>
  <input type="text" name="email">
  <input type="password" name="password">
  <button type="submit">Sign In</button>
</form>
```

### Context object

The `onSubmit`, `onSuccess` and `onError` functions also receive a second argument: an object with your form and input elements, your configuration and some helper functions (just like the ones returned from `createForm`):

```js
const { form } = createForm({
  onSubmit: async (values, {
    form,
    controls,
    config,
    setFields,
    setData,
    setTouched,
    setErrors,
    setWarnings,
    unsetField,
    addField,
    resetField,
    reset,
    setInitialValues,
  }) => {
    // ...
  },
});
```

* `form` is an HTML form element. This can be useful if you want to send your dara as `FormData`.
* `controls` is an array containing your HTML elements that refer to your controls.
* `config` is the original configuration you passed to `createForm`.
* The rest are some of the same helpers documented in the [helper functions section](/docs/svelte/helper-functions)

Events contain these same properties from context alongside a `response` property for the `feltesuccess` event, and an `error`property for the `felteerror` event.

> **NOTE**: TypeScript users may import the types `FelteSuccessEvent`, `FelteErrorEvent`, `FelteSuccessDetail` and `FelteErrorDetail` from this package.
