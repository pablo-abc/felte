---
section: Reporters
subsections:
  - Using Tippy.js
  - Using the DOM
  - Using a Svelte component
  - Using the constraint validation API
  - Build your own
---

## Reporters

This is the most "unique" part about Felte. Felte offers an easy _plugin-like_ way of reporting your errors by using what we call `reporters`. Their job is to handle errors for you. The degree to which they do that depends on how each reporter is build. For example they can report your errors using a tooltip, or modifying the DOM itself to add your validation messages. We provide some official reporters you can use:

### Using Tippy.js

The `@felte/reporter-tippy` package leverages **[Tippy.js](https://atomiks.github.io/tippyjs/)** to report your validation messages. You will also need to install Tippy.js as a separate dependency to use it.

```sh
# npm
npm i -S @felte/reporter-tippy tippy.js

# yarn
yarn add @felte/reporter-tippy tippy.js
```

You may also want to add Tippy's CSS somewhere in your project.

```javascript
import 'tippy.js/dist/tippy.css';
```

In order to use it, you'll need to import it in your component and add it to the `extend` option of `createForm`.

```javascript
import reporter from '@felte/reporter-tippy';
import { createForm } from 'felte';

const { form } = createForm({
  // ...
  extend: reporter,
  // ...
});
```

And that's it! Your validation messages will be shown by Tippy without any more work.

### Using a Svelte component

The `@felte/reporter-svelte` package will fill like a more traditional way to handle your validation messages.

```sh
# npm
npm i -S @felte/reporter-svelte

# yarn
yarn add @felte/reporter-svelte
```

If you're using **[Sapper](https://sapper.svelte.dev)** you might want to add it as a dev dependency.

```sh
# npm
npm i -D @felte/reporter-svelte

# yarn
yarn add -D @felte/reporter-svelte
```

It exports a `svelteReporter` function and a `ValidationMessage` component. Pass tge `svelteReporter` function to the `extend` option of `createForm` and add the `ValidationMessage` component wherever you want your validation messages to be displayed.

The `ValidationMessage` component needs a `for` prop set with the **id** of the input it corresponds to, the error messages will be passed to you via the `messages` slot prop. The default slot will be rendered when there are errors, and the `placeholder` slot when there aren't any. The `placeholder` slot is optional and if not used, you'll need to handle any falsy values for `messages` yourself.

```html
<script>
  import { svelteReporter, ValidationMessage } from '@felte/reporter-svelte';
  import { createForm } from 'felte';

  const { form } = createForm({
      // ...
      extend: svelteReporter,
      // ...
    },
  })
</script>

<form use:form>
  <input id="email" type="text" name="email">
  <ValidationMessage for="email" let:messages={message}>
    <!-- We assume a single string will be passed as a validation message -->
    <!-- This can be an array of strings depending on your validation strategy -->
    <span>{message}</span>
    <span name="placeholder">Please type a valid email.</span>
  </ValidationMessage>
  <input type="password" name="password">
  <ValidationMessage for="password" let:messages={message}>
    <span>{message || ''}</span>
  </ValidationMessage>
  <input type="submit" value="Sign in">
</form>
```

### Using the DOM

The `@felte/reporter-dom` is similar to the `@felte/reporter-svelte` package, but it modifies the dom directly for you.

```sh
# npm
npm i -S @felte/reporter-dom

# yarn
yarn add @felte/reporter-dom
```

The default export is a function you can pass options to that describe the behaviour. The current options are:

```typescript
interface DomReporterOptions {
  listType?: 'ul' | 'ol';
  single?: boolean;
}
```

- `single` tells the reporter to display only a single message with a `span` element. If false, displays the messages in a list. Default: `false`.
- `listType` defines the element to be used for the list. Default: `ul`.

Add it to the `extend` property of Felte's `createForm` configuration object.

```javascript
import reporterDom from '@felte/reporter-dom';

const { form } = createForm({
  // ...
  extend: reporterDom(),
  // ...
});
```

In order to show the errors for a field, you'll need to add a container for each of these elements. For example

```html
<label for="email">Email:</label>
<input id="email" name="email" aria-describedby="email-validation">
<div id="email-validation" data-felte-reporter-dom-for="email" aria-live="polite" />
```

You can choose individually if you want to show errors as a `span` or a list with the attributes `data-felte-reporter-dom-as-single` and `data-felte-reporter-dom-as-list` respectively.


#### Styling

This reporter will add the error messages inside of your container element.

If the `single` option is `true`, then it will add a single message in a `span` element with the attribute `data-felte-reporter-dom-single-message`. You can style this with the CSS selector `[data-felte-reporter-dom-single-message]`.

If `single` is `false` the it will add a single list (using the element defined in `listType`) with the attribute `data-felte-reporter-dom-list`. The list will containe a `li` element per message, each with the attribute `data-felte-reporter-dom-list-message`. You can style them using a similar CSS selector as described above.

### Using the constraint validation API

The `@felte/reporter-cvapi` package leverages the browser's [constraint validation API](https://developer.mozilla.org/en-US/docs/Web/API/Constraint_validation) to report errors.

```sh
# npm
npm i -S @felte/reporter-cvapi

# yarn
yarn add @felte/reporter-cvapi
```

In order to use it, add it to the `extend` property of Felte's `createForm` configuration object.

```javascript
import { createForm } from 'felte';
import reporter from '@felte/reporter-cvapi';

const { form } = createForm({
  // ...
  extend: reporter,
  // ...
});
```

And that's it!

Note: This might not be recommended since it might not be friendly for mobile users.

### Build your own

A `reporter` is a simple function that gets called when `createForm` is called, when the `form` action is called and whenever the form changes.

```javascript
function reporter({
  form,
  controls,
  data,
  errors,
  touched,
}) {
  // ...
  return {
    destroy() {
      // ...
    },
    onSubmitError(errors) {
      // ...
    },
  }
}
```

- `form` refers to the [HTMLFormElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormElement) of the form you're handling. The first time the reporter is called, this will be `undefined`. Whenever the `form` action is called (and on any subsequent call) this will contain the appropriate element.
- `controls` refer to the the form controls of the form that are handled by Felte. The first time the reporter is called, this will be `undefined`. Whenever the `form` action is called (and on any subsequent call) this will contain the appropriate elements.
- `data` is the same `data` store that `createForm` returns.
- `errors` is the same `errors` store that `createForm` returns.
- `touched` is the same `touched` store that `createForm` returns.

If you're subscribing to any store, or adding any event listeners in the reporter, you will want to unsubscribe and/or remove any event listeners in the `destroy` function that you can return from the reporter. If you're not using any events or subscribing to any store, you don't need to set this.

If you want to perform an action whenever there are errors on a `submit` event (e.g. server validation), you can handle them in the `onSubmitError` function. This will receive the current values contained in the `errors` store.
