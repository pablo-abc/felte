# @felte/react

[![Bundle size](https://img.shields.io/bundlephobia/min/@felte/react)](https://bundlephobia.com/result?p=@felte/react)
[![NPM Version](https://img.shields.io/npm/v/@felte/react)](https://www.npmjs.com/package/@felte/react)

Experimental package to integrate Felte with React. We make sure to only call `createForm` once on component initialization by using our own `useConst` hook.

We also export another hook `useValue` used to subscribe to a specific store (this would help prevent unnecessary re-renders). The `useValue` accepts the store you want to subscribe to as the first argument, and a function as an optional second argument that acts as a selector. This selector will receive the current value of the store and expects you to return a specific property from the store, allowing you to control re-renders to specific fields if you need a value from a store in the component.

Unlike other integrations, to maintain consistency with React, the function to create a form is called `useForm` and, instead of `form` it returns `formRef`. API changes will be needed to make the API more friendly and consistent. And Svelte is a dependency since we're using its `writable` store as a store factory. Although this does not add much to the bundle, just a few lines.

## Usage example

```jsx
import React, { useEffect } from 'react';
import { useValue, useForm } from '@felte/react';

function Form() {
  const { formRef, data } = useForm({
    initialValues: {
      email: '',
      password: '',
    },
    onSubmit: (values) => console.log(values),
  });

  // We subscribe only to `email`.
  // The component will NOT re-ender if the user types on `password`
  const email = useValue(data, ($data) => $data.email);

  useEffect(() => {
    console.log(email);
  }, [email]);

  return (
    <form ref={formRef}>
      <input name="email" />
      <input name="password" type="password" />
      <button type="submit">Submit</button>
    </form>
  );
}
```

More documentation coming soon.
