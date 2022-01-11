# @felte/solid

[![Bundle size](https://img.shields.io/bundlephobia/min/@felte/solid)](https://bundlephobia.com/result?p=@felte/solid)
[![NPM Version](https://img.shields.io/npm/v/@felte/solid)](https://www.npmjs.com/package/@felte/solid)


Felte is a simple to use form library originally built for Svelte but only needing minor modifications to work well with Solid. For Solid its functionality is based on the `use` directive. No `Field` or `Form` components, just plain stores and directives to build your form however you like. You can see it in action in this [CodeSandbox demo](https://codesandbox.io/s/felte-demo-solidjs-w92uj?file=/src/main.tsx)!

**STATUS:** Useable but expect some issues. Since we're reusing Felte's core but exchanging Svelte stores for Solid stores, everything should work as expected but further testing might be needed to guarantee this. It should be compatible with every extender package for Felte, except `@felte/reporter-svelte` for obvious reasons.

## Features

- Single action to make your form reactive.
- Use HTML5 native elements to create your form. (Only the `name` attribute is necessary).
- Provides stores and helper functions to handle more complex use cases.
- No assumptions on your validation strategy. Use any validation library you want or write your own strategy.
- Handles addition and removal of form controls during runtime.
- Official solutions for error reporting using `reporter` packages.
- Well tested. Currently at [99% code coverage](https://app.codecov.io/gh/pablo-abc/felte) and constantly working on improving test quality.
- Supports validation with [yup](./packages/validator-yup/README.md), [zod](./packages/validator-zod/README.md) and [superstruct](./packages/validator-superstruct/README.md).
- Easily [extend its functionality](https://felte.dev/docs/solid/extending-felte).

## Simple usage example

```jsx
import { createForm } from '@felte/solid';

const Form = () => {
  const { form } = createForm({
    // ...
    onSubmit: (values) => console.log(values),
    // ...
  });
  return (
    <form use:form>
      <input type="text" name="email" />
      <input type="password" name="password" />
      <input type="submit" value="Sign in" />
    </form>
  )
}
```

If your `onSubmit` would only require you to send your data to a server (either via `POST` or `GET`) you don't even need an `onSubmit` handler by using the `action` and `method` attributes:

```jsx
import { createForm } from '@felte/solid';

const Form = () => {
  const { form } = createForm();
  return (
    <form use:form action="/example-signin" method="post">
      <input type="text" name="email" />
      <input type="password" name="password" />
      <input type="submit" value="Sign in" />
    </form>
  )
}
```

## Installation

```sh
npm install --save @felte/solid

# Or, if you use yarn

yarn add @felte/solid
```

## Usage

To learn more about how to use `@felte/solid` to handle your forms, check the [official documentation](https://felte.dev/docs/solid/getting-started).
