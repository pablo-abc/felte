# @felte/react

[![Bundle size](https://img.shields.io/bundlephobia/min/@felte/react)](https://bundlephobia.com/result?p=@felte/react)
[![NPM Version](https://img.shields.io/npm/v/@felte/react)](https://www.npmjs.com/package/@felte/react)

Felte is an extensible form library originally built for Svelte but easily integrated with React using this package. Felte, on its most simple form, only requires you to set a `ref` to your form element to work. No custom `Field`or `Form` components are needed, making custom styles really easy to do. You can see it in action in this [CodeSandbox demo](https://codesandbox.io/s/felte-react-demo-q2xxw?file=/src/App.js)

## Features

- Single action to make your form reactive.
- Use HTML5 native elements to create your form. (Only the `name` attribute is necessary).
- No re-renders at all unless you need to use a specific field's value within your component.
- Provides stores and helper functions to handle more complex use cases.
- No assumptions on your validation strategy. Use any validation library you want or write your own strategy.
- Handles addition and removal of form controls during runtime.
- Official solutions for error reporting using `reporter` packages.
- Well tested. Currently at [99% code coverage](https://app.codecov.io/gh/pablo-abc/felte) and constantly working on improving test quality.
- Supports validation with [yup](./packages/validator-yup/README.md), [zod](./packages/validator-zod/README.md) and [superstruct](./packages/validator-superstruct/README.md).
- Easily [extend its functionality](https://felte.dev/docs/react/extending-felte).

## Simple ussage example

```jsx
import React, { useEffect } from 'react';
import { useForm } from '@felte/react';

function Form() {
  const { form } = useForm({
    onSubmit: (values) => console.log(values),
  });

  return (
    <form ref={form}>
      <input name="email" />
      <input name="password" type="password" />
      <button type="submit">Submit</button>
    </form>
  );
}
```

If your `onSubmit` would only require you to send your data to a server (either via `POST` or `GET`) you don't even need an `onSubmit` handler by using the `action` and `method` attributes:

```jsx
import React, { useEffect } from 'react';
import { useForm } from '@felte/react';

function Form() {
  const { form } = useForm();

  return (
    <form ref={form} action="/example-signin" method="post">
      <input name="email" />
      <input name="password" type="password" />
      <button type="submit">Submit</button>
    </form>
  );
}
```

## Installation

```sh
npm install --save @felte/react

# Or, if you use yarn

yarn add @felte/react
```

## Usage

To learn more about how to use `@felte/react` to handle your forms, check the [official documentation](https://felte.dev/docs/react/getting-started).
