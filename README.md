![Felte](./packages/site/static/felte-logo-thin.png)

# Felte: A form library for Svelte, Solid and React

[![Tests](https://github.com/pablo-abc/felte/workflows/Tests/badge.svg)](https://github.com/pablo-abc/felte/actions/workflows/test.yml)
[![Bundle size](https://img.shields.io/bundlephobia/min/felte)](https://bundlephobia.com/result?p=felte)
[![NPM Version](https://img.shields.io/npm/v/felte)](https://www.npmjs.com/package/felte)
[![codecov](https://codecov.io/gh/pablo-abc/felte/branch/main/graph/badge.svg?token=T73OJZ50LC)](https://codecov.io/gh/pablo-abc/felte)
<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-12-orange.svg?style=flat-square)](#contributors-)
<!-- ALL-CONTRIBUTORS-BADGE:END -->

- [Features](#features)
- [Simple usage example](#simple-usage-example)
  - [Svelte](#svelte)
  - [Solid](#solid)
  - [React](#react)
- [Why](#why)
- [Packages](#packages)
  - [Svelte](#svelte-1)
    - [`felte`](./packages/felte/README.md)
    - [`@felte/reporter-svelte`](./packages/reporter-svelte/README.md)
  - [Solid](#solid-1)
    - [`@felte/solid`](./packages/solid/README.md)
    - [`@felte/reporter-solid`](./packages/reporter-solid/README.md)
  - [React](#react-1)
    - [`@felte/react`](./packages/react/README.md)
    - [`@felte/reporter-react`](./packages/reporter-react/README.md)
  - [Validators](#validators)
    - [`@felte/validator-yup`](./packages/validator-yup/README.md)
    - [`@felte/validator-zod`](./packages/validator-zod/README.md)
    - [`@felte/validator-superstruct`](./packages/validator-superstruct/README.md)
    - [`@felte/validator-vest`](./packages/validator-vest/README.md)
  - [Reporters](#reporters)
    - [`@felte/reporter-tippy`](./packages/reporter-tippy/README.md)
    - [`@felte/reporter-cvapi`](./packages/reporter-cvapi/README.md)
    - [`@felte/reporter-dom`](./packages/reporter-dom/README.md)
- [Contributing](#contributing)
- [Contributors](#contributors-)

Felte is a simple to use form library for Svelte, Solid and React. No `Field` or `Form` components are needed, just plain stores and actions to build your form however you like. You can see it in action in this [CodeSandbox demo](https://codesandbox.io/s/felte-demo-wce2h?file=/App.svelte)!

## Features

- Single action to make your form reactive.
- Use HTML5 native elements to create your form. (Only the `name` attribute is necessary).
- Provides stores and helper functions to handle more complex use cases.
- No assumptions on your validation strategy. Use any validation library you want or write your own strategy.
- Handles addition and removal of form controls during runtime.
- Official solutions for error reporting using `reporter` packages.
- Well tested. Currently at [99% code coverage](https://app.codecov.io/gh/pablo-abc/felte) and constantly working on improving test quality.
- Supports validation with [yup](./packages/validator-yup/README.md), [zod](./packages/validator-zod/README.md), [superstruct](./packages/validator-superstruct/README.md) and [vest](./packages/validator-vest/README.md).
- Easily [extend its functionality](https://felte.dev/docs/svelte/extending-felte).

## Simple usage example

### Svelte

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

### Solid

```jsx
import { createForm } from '@felte/solid';

function Form() {
  const { form } = createForm({
    onSubmit: async (values) => {
      /* call to an api */
    },
  })

  return (
    <form use:form>
      <input type="text" name="email" />
      <input type="password" name="password" />
    </form>
  );
}
```

### React

```jsx
import { useForm } from '@felte/react';

function Form() {
  const { form } = useForm({
    onSubmit: async (values) => {
      /* call to an api */
    },
  })

  return (
    <form ref={form}>
      <input type="text" name="email" />
      <input type="password" name="password" />
    </form>
  );
}
```

## Packages

This repository is a mono-repo containing multiple packages located in the `packages` directory. Maintained using [pnpm](https://pnpm.io) and [Changesets](https://github.com/atlassian/changesets).

### Svelte

We provide two packages that are specific to Svelte:

#### [felte](./packages/felte/README.md)

This is the core package that contains all the basic functionality you need to handle your forms in Svelte. Felte optionally allows you to use error reporters (see them as plugins) to prevent you from needing to find a way to display your errors on your form manually. For this we provide already some reporter packages contained in this same repo.

#### [@felte/reporter-svelte](./packages/reporter-svelte/README.md)

A reporter package that uses a Svelte component to pass the validation messages for you to display. This provides an API that might feel the most familiar to most developers.

### Solid

We provide two packages that are specific to Solid:

#### [@felte/solid](./packages/solid/README.md)

This is the core package that contains all the basic functionality you need to handle your forms in Solid. Same as `felte` but specifically made for Solid.

#### [@felte/reporter-solid](./packages/reporter-solid/README.md)

A reporter package that uses a Solid component to pass the validation messages for you to display. This provides an API that might feel the most familiar to most developers.

### React

We provide two packages that are specific to React:

#### [@felte/react](./packages/react/README.md)

This is the main package that contains the basic functionality you need to handle your forms in React. Same as `felte` but specifically made for React.

#### [@felte/reporter-react](./packages/reporter-react/README.md)

A reporter packages that uses a React component to pass the validation messages for you to display. This provides an API that might feel the most familiar to most developers.

### Validators

The following packages can be used with any of the framework specific `felte` wrappers:

#### [@felte/validator-yup](./packages/validator-yup/README.md)

A utility package to help you validate your form with [Yup](https://github.com/jquense/yup).

#### [@felte/validator-zod](./packages/validator-zod/README.md)

A utility package to help you validate your form with [Zod](https://github.com/colinhacks/zod).

#### [@felte/validator-superstruct](./packages/validator-superstruct/README.md)

A utility package to help you validate your form with [Superstruct](https://docs.superstructjs.org).

#### [@felte/validator-vest](./packages/validator-vest/README.md)

A utility package to help you validate your form with [Vest](https://vest.vercel.app).

### Reporters

The following packages can be used with any of the framework specific `felte` wrappers:

#### [@felte/reporter-tippy](./packages/reporter-tippy/README.md)

A reporter that uses [Tippy.js](https://atomiks.github.io/tippyjs/) to display your validation messages without needing any extra work.

#### [@felte/reporter-cvapi](./packages/reporter-cvapi/README.md)

A reporter that uses the browser's [constraint validation API](https://developer.mozilla.org/en-US/docs/Web/API/Constraint_validation) to display your validation messages.

#### [@felte/reporter-dom](./packages/reporter-dom/README.md)

A reporter that displays the error messages in the DOM, either as a single element or a list of elements.

## Contributing

If you want to contribute to this project you may check [`CONTRIBUTING.md`](./CONTRIBUTING.md) for general guidelines on how to do so.

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://github.com/pablo-abc"><img src="https://avatars.githubusercontent.com/u/40573613?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Pablo Berganza</b></sub></a><br /><a href="https://github.com/pablo-abc/felte/commits?author=pablo-abc" title="Code">💻</a> <a href="https://github.com/pablo-abc/felte/commits?author=pablo-abc" title="Documentation">📖</a> <a href="#ideas-pablo-abc" title="Ideas, Planning, & Feedback">🤔</a> <a href="#maintenance-pablo-abc" title="Maintenance">🚧</a> <a href="https://github.com/pablo-abc/felte/commits?author=pablo-abc" title="Tests">⚠️</a></td>
    <td align="center"><a href="https://github.com/loremaps"><img src="https://avatars.githubusercontent.com/u/18003912?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Panagiotis Kapros</b></sub></a><br /><a href="https://github.com/pablo-abc/felte/commits?author=loremaps" title="Code">💻</a></td>
    <td align="center"><a href="https://codepoet.de/"><img src="https://avatars.githubusercontent.com/u/462455?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Benjamin Bender</b></sub></a><br /><a href="https://github.com/pablo-abc/felte/commits?author=benbender" title="Code">💻</a> <a href="#ideas-benbender" title="Ideas, Planning, & Feedback">🤔</a> <a href="https://github.com/pablo-abc/felte/commits?author=benbender" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/abhijit-kar"><img src="https://avatars.githubusercontent.com/u/25662120?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Abhijit Kar ツ</b></sub></a><br /><a href="https://github.com/pablo-abc/felte/issues?q=author%3Aabhijit-kar" title="Bug reports">🐛</a> <a href="#ideas-abhijit-kar" title="Ideas, Planning, & Feedback">🤔</a></td>
    <td align="center"><a href="https://convertpack.io/"><img src="https://avatars.githubusercontent.com/u/741969?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Hugo Maestá</b></sub></a><br /><a href="https://github.com/pablo-abc/felte/commits?author=hmaesta" title="Code">💻</a> <a href="#ideas-hmaesta" title="Ideas, Planning, & Feedback">🤔</a></td>
    <td align="center"><a href="https://github.com/websocket98765"><img src="https://avatars.githubusercontent.com/u/41795874?v=4?s=100" width="100px;" alt=""/><br /><sub><b>websocket98765</b></sub></a><br /><a href="https://github.com/pablo-abc/felte/issues?q=author%3Awebsocket98765" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://github.com/avimar"><img src="https://avatars.githubusercontent.com/u/314077?v=4?s=100" width="100px;" alt=""/><br /><sub><b>avimar</b></sub></a><br /><a href="https://github.com/pablo-abc/felte/commits?author=avimar" title="Documentation">📖</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://umanggalaiya.in/"><img src="https://avatars.githubusercontent.com/u/5698706?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Umang Galaiya</b></sub></a><br /><a href="https://github.com/pablo-abc/felte/commits?author=umanghome" title="Code">💻</a> <a href="https://github.com/pablo-abc/felte/issues?q=author%3Aumanghome" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://github.com/djhi"><img src="https://avatars.githubusercontent.com/u/1122076?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Gildas Garcia</b></sub></a><br /><a href="https://github.com/pablo-abc/felte/commits?author=djhi" title="Code">💻</a> <a href="https://github.com/pablo-abc/felte/issues?q=author%3Adjhi" title="Bug reports">🐛</a></td>
    <td align="center"><a href="https://github.com/basaran"><img src="https://avatars.githubusercontent.com/u/30809170?v=4?s=100" width="100px;" alt=""/><br /><sub><b>basaran</b></sub></a><br /><a href="https://github.com/pablo-abc/felte/commits?author=basaran" title="Code">💻</a> <a href="https://github.com/pablo-abc/felte/issues?q=author%3Abasaran" title="Bug reports">🐛</a></td>
    <td align="center"><a href="http://ealush.com/"><img src="https://avatars.githubusercontent.com/u/11255103?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Evyatar</b></sub></a><br /><a href="https://github.com/pablo-abc/felte/commits?author=ealush" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/schurhammer"><img src="https://avatars.githubusercontent.com/u/2063443?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Julian Schurhammer</b></sub></a><br /><a href="https://github.com/pablo-abc/felte/commits?author=schurhammer" title="Code">💻</a></td>
  </tr>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!

## License

MIT

## Browser support

While further testing would be needed to provide an accurate answer, Felte should work in all evergreen browsers. Polyfills might be needed if you target older browsers such as IE 11 for, at least, `Promise.all`, `Element.closest`, `URLSearchParams`, `fetch`, `CustomEvent` and iterators.
