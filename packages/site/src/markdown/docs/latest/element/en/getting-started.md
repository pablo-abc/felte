---
section: Getting started
---

## Getting started

Felte is a JavaScript library that tries to help you ease the management of forms, form validation and the reporting of validation errors. To use its basic functionalities you'll only need the base `@felte/element` package from npm or through a CDN.

### Using a CDN

`@felte/element` is only distributed as an ES module. You can import it directly from a CDN in a `<script type="module">` tag.

```html
<script type="module">
  import 'https://unpkg.com/@felte/element@<VERSION>/dist/index.min.js';
</script>
```

The easiest way to use it would be to import the `prepareForm` function from the module to set up your form. `prepareForm` receives the `id` of a `felte-form` element as its first argument, and a configuration object as its second argument:

```html
<script type="module">
  import { prepareForm } from 'https://unpkg.com/@felte/element@<VERSION>/dist/index.min.js';

  prepareForm('signin-form', {
    onSubmit: (values) => {
      // ...
    },
  }).then((felteForm) => {
    // Here you'd have access to all of the form's methods and properties
    // if you need them.
  });
</script>

<felte-form id="signin-form">
  <form>
    <input type="text" name="email" />
    <input type="password" name="password" />
    <button type="submit">Sign In</button>
  </form>
</felte-form>
```

> **NOTE**: If you're only using `felte-form` (not `felte-field`) you can import it directly from `/dist/felte-form.min.js'.

### NPM

`@felte/element` is also available as an NPM package. Install it with your favorite package manager:

```sh
npm i -S @felte/element
```

If you use pnpm:

```sh
pnpm add @felte/element
```

If you use yarn:

```sh
yarn add @felte/element
```

Then use it in your HTML as mentioned above, but importing from your local installation:

```html
<script type="module">
  import { prepareForm } from '@felte/element';

  prepareForm('signin-form', {
    onSubmit: (values) => {
      // ...
    },
  }).then((felteForm) => {
    // Here you'd have access to all of the form's methods and properties
    // if you need them.
  });
</script>

<felte-form id="signin-form">
  <form>
    <input type="text" name="email" />
    <input type="password" name="password" />
    <button type="submit">Sign In</button>
  </form>
</felte-form>
```

> **NOTE**: You can also import `felte-form` directly from `@felte/element/dist/felte-form.js` or `@felte/element/dist/felte-form.min.js`.

The `onSubmit` handler is actually optional. If no handler is provided, Felte will send a request using `fetch` with the `action`, `method` and `enctype` attributes of your `form` element. It will send the request as `multipart/form-data` if you specify it with the `enctype` (which you should do if your form contains an `<input type=file>`), or `application/x-www-form-urlencoded`. If doing this, you don't need to import `prepareForm`, just the package for its side effects.

```html
<script type="module">
  import '@felte/element';
</script>

<felte-form>
  <form action="/example" method="post">
    <input type="text" name="email" />
    <input type="password" name="password" />
    <button type="submit">Sign In</button>
  </form>
</felte-form>
```

You can react to the form's state using events when using it like this.

> You can read more about the different ways to submit your forms and its events in the [submitting section](/docs/element/submitting).

### Without prepareForm

You don't need to use `prepareForm`, instead you can set up the `configuration` property of the element directly. If you're using a framework that allows you to pass values directly as properties instead of attributes (such as [Lit](https://lit.dev)), this may look cleaner.

```html
<script type="module">
  import '@felte/element';

  const felteForm = document.querySelector('felte-form');

  felteForm.configuration = {
    onSubmit: (values) => {
      // ...
    },
  };
</script>

<felte-form>
  <form action="/example" method="post">
    <input type="text" name="email">
    <input type="password" name="password">
    <button type="submit">Sign In</button>
  </form>
</felte-form>
```

Felte does not export any components like `Form`, `Field` or anything like that, but you do need to make felte aware of your inputs by assigning a **name** to them.

Felte also offers [validation handling](/docs/element/validation) and [error reporting](/docs/element/reporters) but this is all you need for the most basic, validation-less form.

> **NOTE**: TypeScript users can find the type for `<felte-form>` and `<felte-field>` globally as `HTMLFelteFormElement` and `HTMLFelteFieldElement`.
