# Felte: A form library for Svelte

![Tests](https://github.com/pablo-abc/felte/workflows/Tests/badge.svg)
![Bundle size](https://img.shields.io/bundlephobia/min/felte)
![NPM Version](https://img.shields.io/npm/v/felte)

- [Why](#why)
- [Packages](#packages)
  - [`felte`](./packages/felte/README.md)
  - [`@felte/reporter-tippy`](./packages/reporter-tippy/README.md)
  - [`@felte/reporter-cvapi`](./packages/reporter-cvapi/README.md)

Felte is a simple to use form library for Svelte. It is based on Svelte stores and Svelte actions for its functionality. No `Field` or `Form` components, just plain stores and actions to build your form however you like. You can see it in actino in this [CodeSandbox demo](https://codesandbox.io/s/felte-demo-wce2h?file=/App.svelte)!

**WARNING:** Felte's and it's accompanying packages' API is not set in stone yet, so breaking changes may occur between minor versions until it is stable enough to be 1.0.0

## Why

I felt that Svelte would allow to create a simple, almost configuration-less way to handle forms. Current libraries (at least that I have found) still make forms feel reliant on a lot of configuration, or custom Field and Form components which make it a little bit harder to customize styles. I wanted a library that would feel as simple as possible to make a form reactive, without relying on custom components, to make styling and handling forms as simple as possible. TypeScript is also a big plus.

In order to accomplish usage as simple as possible, Felte takes advantage of Svelte actions to be able to make a form reactive using only the `use` directive. Felte also has built-in error reporting capabilities by using `reporters` such as `@felte/reporter-tippy` and `@felte/reporter-cvapi`.


## Packages

This repository is a mono-repo containing multiple packages located in the `packages` directory. (Maintained using [Lerna](https://lerna.js.org/)).

### [felte](./packages/felte/README.md)

This is the core package that contains all the basic functionality you need to handle your forms in Svelte. Felte optionally allows you to use error reporters (see them as plugins) to prevent you from needing to find a way to display your errors on your form manually. For this we provide already two packages `@felte/reporter-tippy` and `@felte/reporter-cvapi`.

### [@felte/reporter-tippy](./packages/reporter-tippy/README.md)

A reporter that uses [Tippy.js](https://atomiks.github.io/tippyjs/) to display your validation messages without needing any extra work.

### [@felte/reporter-cvapi](./packages/reporter-cvapi/README.md)

A reporter that uses the browser's [constraint validation API](https://developer.mozilla.org/en-US/docs/Web/API/Constraint_validation) to display your validation messages.

## License

MIT
