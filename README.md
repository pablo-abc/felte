# Felte: A form library for Svelte

[![Tests](https://github.com/pablo-abc/felte/workflows/Tests/badge.svg)](https://github.com/pablo-abc/felte/actions/workflows/test.yml)
[![Bundle size](https://img.shields.io/bundlephobia/min/felte)](https://bundlephobia.com/result?p=felte)
[![NPM Version](https://img.shields.io/npm/v/felte)](https://www.npmjs.com/package/felte)
[![codecov](https://codecov.io/gh/pablo-abc/felte/branch/main/graph/badge.svg?token=T73OJZ50LC)](https://codecov.io/gh/pablo-abc/felte)

- [Why](#why)
- [Packages](#packages)
  - [`felte`](./packages/felte/README.md)
  - [`@felte/reporter-tippy`](./packages/reporter-tippy/README.md)
  - [`@felte/reporter-cvapi`](./packages/reporter-cvapi/README.md)
  - [`@felte/reporter-dom`](./packages/reporter-dom/README.md)
  - [`@felte/reporter-svelte`](./packages/reporter-svelte/README.md)
  - [`@felte/common`](./packages/common/README.md)

Felte is a simple to use form library for Svelte. It is based on Svelte stores and Svelte actions for its functionality. No `Field` or `Form` components, just plain stores and actions to build your form however you like. You can see it in action in this [CodeSandbox demo](https://codesandbox.io/s/felte-demo-wce2h?file=/App.svelte)!

**STATUS:** Useable. Felte's API is stable enough to be used. I feel the main API is solid enough to not need breaking changes that fast, but more usage input would be useful. If you're interested please give it a try and feel free to open an issue if there's anything missing!

## Features

- Single action to make your form reactive.
- Use HTML5 native elements to create your form. (Only the `name` attribute is necessary).
- Provides stores and helper functions to handle more complex use cases.
- No assumptions on your validation strategy. Use any validation library you want or write your own strategy.
- Handles addition and removal of form controls during runtime.
- Official solutions for error reporting using `reporter` packages.
- Well tested. Currently at [99% code coverage](https://app.codecov.io/gh/pablo-abc/felte) and constantly working on improving test quality.

## Simple usage example

```html
<script>
  import { createForm } from 'felte'

  const { form } = createForm({
    onSubmit: async (values) => {
      /* call to an api */
    },
  })
</script>

<form use:form>
  <input type=text name=email>
  <input type=password name=password>
  <input type=submit value="Sign in">
</form>
```

## Why

I felt that Svelte would allow to create a simple, almost configuration-less way to handle forms. Current libraries (at least that I have found) still make forms feel reliant on a lot of configuration, or custom Field and Form components which make it a little bit harder to customize styles. I wanted a library that would feel as simple as possible to make a form reactive, without relying on custom components, to make styling and handling forms as simple as possible. TypeScript is also a big plus.

In order to accomplish usage as simple as possible, Felte takes advantage of Svelte actions to be able to make a form reactive using only the `use` directive. Felte also has built-in error reporting capabilities by using `reporters` such as `@felte/reporter-tippy`, `@felte/reporter-cvapi` and `@felte/reporter-dom`.


## Packages

This repository is a mono-repo containing multiple packages located in the `packages` directory. Maintained using [Bolt](https://github.com/boltpkg/bolt) and [Changesets](https://github.com/atlassian/changesets).

### [felte](./packages/felte/README.md)

This is the core package that contains all the basic functionality you need to handle your forms in Svelte. Felte optionally allows you to use error reporters (see them as plugins) to prevent you from needing to find a way to display your errors on your form manually. For this we provide already some reporter packages contained in this same repo.

### [@felte/reporter-tippy](./packages/reporter-tippy/README.md)

A reporter that uses [Tippy.js](https://atomiks.github.io/tippyjs/) to display your validation messages without needing any extra work.

### [@felte/reporter-cvapi](./packages/reporter-cvapi/README.md)

A reporter that uses the browser's [constraint validation API](https://developer.mozilla.org/en-US/docs/Web/API/Constraint_validation) to display your validation messages.

### [@felte/reporter-dom](./packages/reporter-dom/README.md)

A reporter that displays the error messages in the DOM, either as a single element or a list of elements.

### [@felte/reporter-svelte](./packages/reporter-svelte/README.md)

A reporter that uses a Svelte component to pass the validation messages for you to display.

### [@felte/common](./packages/common/README.md)

Common utilities that can be used for any felte package.

## License

MIT
