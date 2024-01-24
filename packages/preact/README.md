# Felte: A form library for Preact

[![Tests](https://github.com/pablo-abc/felte/workflows/Tests/badge.svg)](https://github.com/pablo-abc/felte/actions/workflows/test.yml)
[![Bundle size](https://img.shields.io/bundlephobia/min/@felte/preact)](https://bundlephobia.com/result?p=@felte/preact)
[![NPM Version](https://img.shields.io/npm/v/@felte/preact)](https://www.npmjs.com/package/@felte/preact)
[![codecov](https://codecov.io/gh/pablo-abc/felte/branch/main/graph/badge.svg?token=T73OJZ50LC)](https://codecov.io/gh/pablo-abc/felte)

Felte is an extensible form library originally built for Svelte but easily integrated with Preact using this package. Felte, on its most simple form, only requires you to set a `ref` to your form element to work. No custom `Field` or `Form` components are needed, making custom styles really easy to do. If you want to see it in action, you can check this [CodeSandbox demo](https://codesandbox.io/s/felte-preact-demo-svkbbe?file=/src/App.js).

## Features

- Single action to make your form reactive.
- Use HTML5 native elements to create your form. (Only the `name` attribute is necessary).
- No re-renders at all unless you need to use a specific field's value within your component.
- Provides stores and helper functions to handle more complex use cases.
- No assumptions on your validation strategy. Use any validation library you want or write your own strategy.
- Handles addition and removal of form controls during runtime.
- Official solutions for error reporting using `reporter` packages.
- Well tested. Currently at [99% code coverage](https://app.codecov.io/gh/pablo-abc/felte) and constantly working on improving test quality.
- Supports validation with [yup](/packages/validator-yup/README.md), [zod](/packages/validator-zod/README.md) and [superstruct](/packages/validator-superstruct/README.md).
- Easily [extend its functionality](https://felte.dev/docs/react/extending-felte).

## Simple usage example

```jsx
import { h } from 'preact';
import { useForm } from '@felte/preact';

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

## Installation

```sh
npm install --save @felte/preact

# Or, if you use yarn

yarn add @felte/preact
```

## Usage

To learn more about how to use `@felte/preact` to handle your forms, check the [official documentation](https://felte.dev/docs/react/getting-started). The API is exactly the same as `@felte/react` except for the import.
