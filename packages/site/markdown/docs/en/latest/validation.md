---
section: Validation
subsections:
  - Server errors
  - Error handling
---

## Validation

The `createForm` function can also accept a validation function. It's a function that accepts the current form values and needs to return an object with the same shape, but instead of the property values it can have a string or array of strings containing the validation messages.

```javascript
const { form } = createForm({
  // ...
  validate: (values) => {
    const errors = {}
    if (!values.email || !/^[^@ \t\r\n]+@[^@ \t\r\n]+\.[^@ \t\r\n]+/.test(values.email)) {
      errors.email = 'Must be a valid email';
    }
    if (!values.password) errors.password = [
      'Must not be empty',
      'Must be over 8 characters',
    ];
    if (values.password && values.password.length < 8) {
      errors.password = ['Must be over 8 characters'];
    }
    return errors;
  },
  // ...
});
```

It shouldn't be a hard task to use a third party library, as long as you transform their result into something that Felte understands.

Note that the `validate` function **can be asynchronous**.

### Validation with Yup

[Yup](https://github.com/jquense/yup) is a really popular validation library. For this reason we've created [`@felte/validator-yup`](https://github.com/pablo-abc/felte/tree/main/packages/validator-yup). An official package to handle validation with Yup. To use it you'll need both `@felte/validator-yup` and `yup`.

```sh
npm install --save @felte/validator-yup yup

# Or, if you use yarn

yarn add @felte/validator-yup yup
```

It's usage would look something like:

```javascript
import { validateSchema } from '@felte/validator-yup';
import * as yup from 'yup';

const schema = yup.object({
  email: yup.string().email().required(),
  password: yup.string().required(),
});

const { form } = createForm({
  // ...
  validate: validateSchema(schema),
  // ...
});
```

Felte will validate whichever field it considers as `touched` as you fill the form, and it will validate all fields (and set them as `touched`) when submitting it.

### Server errors

You can add an `onError` function to the `createForm` that will be called if the `onSubmit` function throws an error. It will be called with the value thrown from the `onSubmit` function. You can use the `onError` function to shape your server errors into the same shape that the `validate` function expect and return them from the same function for them to be handled.

```javascript
const { form } = createForm({
  // ...
  // Assuming your server already returns them with the appropriate shape.
  // Might not be the case for most cases.
  onError: (errors) => errors,
  // ...
});
```

### Error handling

`createForm` returns also its `errors` and `touched` fields as stores.

```html
<script>
  import { createForm } from 'felte';

  const { form, errors, touched } = createForm({ \*...*\ });
</script>

<pre>
  <!-- Prettify the errors and display them in HTML -->
  {JSON.stringify($errors, null, 2)}
</pre>

<pre>
  {JSON.stringify($touched, null, 2)}
</pre>
```

You can read more above them in the [stores](docs#stores) section.

You don't need to manually handle this errors. Felte provides four official packages to handle your errors for you, either using Tippy, directly mutating the DOM, providing a Svelte component or using the browser's built-in constraint validation API. You can read more about this in the [reporters](docs#reporters) section.
