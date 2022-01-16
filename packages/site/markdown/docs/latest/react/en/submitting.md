---
section: Submitting
subsections:
  - Default handler
  - Custom handler
---

## Submitting

Felte offers two ways to submit your form data:

### Default handler

If no `onSubmit` function is provided on `useForm`, Felte will send a request using the following attributes from your `form` element:

* `action` will be the URL where the request will be sent.
* `method` will be the method used to send the request. This can only be `get` or `post` but you can override it by adding a `_method=VERB` query string to your `action`. Overriding only works if your `method` attribute is set to `post`.
* `enctype` is the MIME type that will be used to post your form data (if your `method` attribute has a value of `post`).

If the request succeeds, Felte will call your `onSuccess` function, if available, with the `Response` object returned from the `fetch` request.

If the request fails, Felte will call your `onError` function, if available, with an instance of `FelteSubmitError` containing the `Response` object returned from the `fetch` request in its `response` property.

```jsx
import { useForm } from '@felte/react';

function onSuccess(response) {
  // Do something with the response.
}

function handleError(error) {
  // `FelteSubmitError` contains a `response` property
  // with the response from `fetch`
  const response = error.response;
  // Do something with the error
}

export function Form() {
  const { form } = useForm({
    onSuccess,
    onError,
  });

  return (
    <form use:form action="/example" method="post">
      <input type="text" name="email" />
      <input type="password" name="password" />
      <button type="submit">Sign In</button>
    </form>
  );
}
```

#### FelteSubmitError

When using the default handler, if the request fails Felte will throw a `FelteSubmitError`. This is a a JavaScript error that contains a `response` property which is the `Response` object from the `fetch` request. The class for `FelteSubmitError` is exported from this package to allow for comparisons with `instanceof`.

#### Fieldsets

When using this method for submitting form, you **can not** use the `name` attribute of a `fieldset` element to nest properties. Even though the `name` attribute is valid for a `fieldset` element, it is not used by the browser to submit data.

### Custom handler

`useForm` accepts an `onSubmit` function on its configuration object. If you set `onSubmit`, the default submit handler **wil not** run. Anything returned by this function will be passed as a first argument to `onSuccess`. Anything thrown from this function will be passed as a first argument to `onError`.

```jsx
import { useForm } from '@felte/react';

export function Form() {
  const { form } = useForm({
    onSubmit(values) {
      // ...
    },
    onSuccess(response) {
      // Do something with the returned value from `onSubmit`.
    },
    onError(err) {
      // Do something with the error thrown from `onSubmit`.
    },
  });

  return (
    <form use:form>
      <input type="text" name="email" />
      <input type="password" name="password" />
      <button type="submit">Sign In</button>
    </form>
  );
}
```
