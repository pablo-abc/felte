# Felte: A form library for Vue JS

[![Tests](https://github.com/pablo-abc/felte/workflows/Tests/badge.svg)](https://github.com/pablo-abc/felte/actions/workflows/test.yml)
[![Bundle size](https://img.shields.io/bundlephobia/min/@felte/vue)](https://bundlephobia.com/result?p=@felte/vanilla)
[![NPM Version](https://img.shields.io/npm/v/@felte/vue)](https://www.npmjs.com/package/@felte/vanilla)
[![codecov](https://codecov.io/gh/pablo-abc/felte/branch/main/graph/badge.svg?token=T73OJZ50LC)](https://codecov.io/gh/pablo-abc/felte)

Felte is an extensible form library originally built for Svelte but now supporting VueJS with the help of this package. Felte, on its most simple form, only requires you to set a directive (`v-form`) on the form you want it to manage. No custom `Field` or `Form` components are needed, making custom styles really easy to do.

## Features

- Single directive to make your form reactive.
- Use HTML5 native elements to create your form. (Only the `name` attribute is necessary).
- Provides stores and helper functions to handle more complex use cases.
- No assumptions on your validation strategy. Use any validation library you want or write your own strategy.
- Handles addition and removal of form controls during runtime.
- Well tested. Currently at [99% code coverage](https://app.codecov.io/gh/pablo-abc/felte) and constantly working on improving test quality.
- Supports validation with [yup](/packages/validator-yup/README.md), [zod](/packages/validator-zod/README.md) and [superstruct](/packages/validator-superstruct/README.md).
- Easily [extend its functionality](https://felte.dev/docs/svelte/extending-felte).

## Simple usage example

```html
<script setup>
  // inside some Vue SFC file
  import { createForm } from '@felte/vue';

  const { form } = createForm({
    onSubmit: (values) => console.log(values);
  });
</script>
<template>
  <form v-form>
    <input type="text" name="email" />
    <input type="password" name="password" />
    <input type="submit" value="Sign in" />
  </form>
</template>
```

## Installation

```sh
npm install --save @felte/vue

# Or, if you use yarn

yarn add @felte/vue
```

## Usage

This package does not have documentation _yet_ but, besides it returning a directive definition instead of an `action` (here returned as `vForm`), the API remains exactly the same as Svelte. You can check the [official documentation](https://felte.dev/docs/svelte/getting-started)
