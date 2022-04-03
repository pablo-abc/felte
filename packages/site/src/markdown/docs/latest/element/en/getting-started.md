---
section: Getting started
---

## Getting started

Felte is a JavaScript library that tries to help you ease the management of forms, form validation and the reporting of validation errors. To use its basic functionalities you'll only need the base `@felte/element` package from npm or through a CDN.

> **NOTE**: This version is being actively developed currently. There is still improvements to be made and there will be breaking changes in between minor versions. If you're using this, make sure to pin your versions and check the changelog whenever you upgrade.

### Using a CDN

`@felte/element` is only distributed as an ES module. You can import it directly from a CDN in a `<script type="module">` tag.

```html
<script type="module">
  // Minified exports:

  // /min/index.js exports the classes for the custom elements and the
  // `prepareForm` helper function. No side effects are run when importing from here.
  import { prepareForm, FelteForm, FelteField } from 'https://unpkg.com/@felte/element@<VERSION>/dist/min/index.js';

  // Side-effects exports. These automatically register `<felte-form`>
  // and `<felte-field>`
  import 'https://unpkg.com/@felte/element@<VERSION>/dist/min/felte-form.js';
  import 'https://unpkg.com/@felte/element@<VERSION>/dist/min/felte-field.js';
</script>
```

The easiest way to use it would be to import the `prepareForm` function from the module to set up your form. `prepareForm` receives the `id` of a `felte-form` element as its first argument, and a configuration object as its second argument:

```html
<script type="module">
  import 'https://unpkg.com/@felte/element@<VERSION>/dist/min/felte-form.js';
  import { prepareForm } from 'https://unpkg.com/@felte/element@<VERSION>/dist/min/index.js';

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

The main export `@felte/element` exposes the classes for FelteField and FelteForm; and the `prepareForm` helper. This main export does not run any side effects, so you can register the custom elements with your own name. E.g. `customElements.define('my-form', FelteForm)`.

Importing from `@felte/element/felte-form` automatically registers the form custom element as `<felte-form>` as a side effect. No other exports are exposed from here.

Importing from `@felte/element/felte-field` automatically registers the field custom element as `<felte-field>` as a side effect. No other exports are exposed from here.

You can use these in your HTML as mentioned above, but importing from your local installation:

```html
<script type="module">
  // Run side-effects
  import '@felte/element/felte-form';
  // Import helper
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

The `onSubmit` handler is actually optional. If no handler is provided, Felte will send a request using `fetch` with the `action`, `method` and `enctype` attributes of your `form` element. It will send the request as `multipart/form-data` if you specify it with the `enctype` (which you should do if your form contains an `<input type=file>`), or `application/x-www-form-urlencoded`. If doing this, you don't need to import `prepareForm`, just the package for its side effects.

```html
<script type="module">
  import '@felte/element/felte-form';
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
  import '@felte/element/felte-form';

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

Example using [Lit](https://lit.dev):

```javascript
import { html, LitElement } from 'lit';
import '@felte/element/felte-form';

export class MyApp extends LitElement {
  render() {
    return html`
        <felte-form
          .configuration=${{
            onSubmit: (values) => console.log(values),
          }}
        >
          <form>
            <input name="email" type="email">
            <input name="password" type="password">
            <button type="submit">Sign in</button>
          </form>
        </felte-form>
        `;
  }
}

customElements.define('my-app', MyApp);
```

Felte does not export any components like `Form`, `Field` or anything like that, but you do need to make felte aware of your inputs by assigning a **name** to them.

Felte also offers [validation handling](/docs/element/validation) and [error reporting](/docs/element/reporters) but this is all you need for the most basic, validation-less form.

> **NOTE**: TypeScript users can find the type for `<felte-form>` and `<felte-field>` globally as `HTMLFelteFormElement` and `HTMLFelteFieldElement`.
