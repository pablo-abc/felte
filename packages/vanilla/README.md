# Felte: A form library for vanilla JS

[![Tests](https://github.com/pablo-abc/felte/workflows/Tests/badge.svg)](https://github.com/pablo-abc/felte/actions/workflows/test.yml)
[![Bundle size](https://img.shields.io/bundlephobia/min/@felte/vanilla)](https://bundlephobia.com/result?p=@felte/vanilla)
[![NPM Version](https://img.shields.io/npm/v/@felte/vanilla)](https://www.npmjs.com/package/@felte/vanilla)
[![codecov](https://codecov.io/gh/pablo-abc/felte/branch/main/graph/badge.svg?token=T73OJZ50LC)](https://codecov.io/gh/pablo-abc/felte)

Felte is an extensible form library originally built for Svelte. This package removes all integrations with frameworks so it can be used with vanilal JS. Unlike `@felte/core`, this package already comes with a store implementation. Felte, on its most simple form, only requires you to pass it your `<form>` element. No custom `Field`or `Form` components are needed, making custom styles really easy to do.

## Features

- Single action to make your form reactive.
- Use HTML5 native elements to create your form. (Only the `name` attribute is necessary).
- Provides stores and helper functions to handle more complex use cases.
- No assumptions on your validation strategy. Use any validation library you want or write your own strategy.
- Handles addition and removal of form controls during runtime.
- Official solutions for error reporting using `reporter` packages.
- Well tested. Currently at [99% code coverage](https://app.codecov.io/gh/pablo-abc/felte) and constantly working on improving test quality.
- Supports validation with [yup](/packages/validator-yup/README.md), [zod](/packages/validator-zod/README.md) and [superstruct](/packages/validator-superstruct/README.md).
- Easily [extend its functionality](https://felte.dev/docs/svelte/extending-felte).

## Simple usage example

```html
<!-- inside some index.html -->
<form id="signin-form">
  <input name="email">
  <input name="password" type="password">
  <button type="submit">Submit</button>
</form>
```

```javascript
// inside some .mjs/.js file
import { createForm } from '@felte/vanilla';

const { form } = createForm({
  onSubmit: (values) => console.log(values);
});

form(document.getElementById('signin-form'));
```

## Installation

```sh
npm install --save @felte/vanilla

# Or, if you use yarn

yarn add @felte/vanilla
```

## Usage

This package is not meant for users as of now. But it can be used as a better starter point to build integrations with other frameworks that do not have their own compatible reactive stores. It's API is the same as the `felte` package without its lifecycle management. Also, unlike other integrations, stores won't get synchronized until you call `form` with your `<form>` element. You may use [`felte`'s documentation](https://felte.dev/docs/svelte/getting-started) as a reference for the most part and just replace any imports of `felte` for `@felte/vanilla`.

Since this package does not attach to any lifecycle hooks, you'll need to handle it manually by calling `destroy` when your form gets unmounted:

```javascript
const { form } = createForm({ /* ... */ });

const { destroy } = form(document.getElementById('signin-form'));

// Call `destroy` when unmounting the form:
destroy();
```
