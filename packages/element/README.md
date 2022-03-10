# @felte/element

[![Tests](https://github.com/pablo-abc/felte/workflows/Tests/badge.svg)](https://github.com/pablo-abc/felte/actions/workflows/test.yml)
[![Bundle size](https://img.shields.io/bundlephobia/min/@felte/element)](https://bundlephobia.com/result?p=@felte/element)
[![NPM Version](https://img.shields.io/npm/v/@felte/element)](https://www.npmjs.com/package/@felte/element)
[![NPM Downloads](https://img.shields.io/npm/dw/@felte/element)](https://www.npmjs.com/package/@felte/element)
[![codecov](https://codecov.io/gh/pablo-abc/felte/branch/main/graph/badge.svg?token=T73OJZ50LC)](https://codecov.io/gh/pablo-abc/felte)

Felte is an extensible form library originally bult for Svelte. This package aims to provide Felte's functionality using a custom element. Felte, on its most simple form, only requires you to provide a `<form>` element to it in order to work.

## Features

- Single action to make your form reactive.
- Use HTML5 native elements to create your form. (Only the `name` attribute is necessary).
- Provides stores and helper functions to handle more complex use cases.
- No assumptions on your validation strategy. Use any validation library you want or write your own strategy.
- Handles addition and removal of form controls during runtime.
- Official solutions for error reporting using `reporter` packages.
- Well tested. Currently at [99% code coverage](https://app.codecov.io/gh/pablo-abc/felte) and constantly working on improving test quality.
- Supports validation with [yup](./packages/validator-yup/README.md), [zod](./packages/validator-zod/README.md) and [superstruct](./packages/validator-superstruct/README.md).
- Easily [extend its functionality](https://felte.dev/docs/element/extending-felte).

## Simple usage example

Using Svelte as an example:

```html
<script type="module">
  import { prepareForm } from '@felte/element';

  prepareForm('signin', {
    onSubmit: async (values) => {
      /* call to an api */
    },
  });
</script>

<felte-form id="signin">
  <form>
    <input type="text" name="email" />
    <input type="password" name="password" />
    <input type="submit" value="Sign in" />
  </form>
</felte-form>
```

## Installation

```sh
npm install --save @felte/element

# Or if you use yarn

yarn add @felte/element
```

## Usage

To learn more about how to use `felte` to handle your forms, check the [official documentation](https://felte.dev/docs/element/getting-started). **TODO**: Add documentation

## Framework compatibility

This package should work nicely with any framework. Specially if you're using the `prepareForm` method of creating your form. It also works really nice with frameworks that set attributes as properties or frameworks that provide syntax to set values to properties of elements instead of attributes.
