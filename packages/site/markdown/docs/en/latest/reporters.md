---
section: Reporters
subsections:
  - Using Tippy.js
  - Using the DOM
  - Using a Svelte component
  - Using the constraint validation API
---

## Reporters

Felte offers an easy _plugin-like_ way of reporting your errors by using what we call `reporters`. Making use of Felte's extensibility, their job is to handle errors for you. The degree to which they do that depends on how each reporter is build. For example they can report your errors using a tooltip, or modifying the DOM itself to add your validation messages. You may use any of the official packages we provide, or [you can build your own](/docs/extending-felte).

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
  extend: reporter(),
  // ...
});
```

And that's it! Your validation messages will be shown by Tippy without any more work.

For a more complex use case, you can pass [options](https://atomiks.github.io/tippyjs/v6/all-props/) to Tippy when calling the reporter like so:

```javascript
reporter({
  tippyProps: {/* tippy options */},
})
```

You can also pass a `setContent` function that will receive the current validation messages. Here you can modify your validation messages, which can come in useful if you want to display HTML content inside of Tippy. The `messages` argument will either by an array of strings (it can be more than one message depending on your validation strategy) or undefined.

```javascript
reporter({
  setContent: (messages) => {
    return messages?.map(message => `<p>${message}</p>`);
  },
  tippyProps: {
    allowHTML: true,
  },
})
```

You may also opt-out of this package reporting your errors for a specific field by adding `data-felte-reporter-tippy-ignore` to the input:

```html
<input name="email" data-felte-reporter-tippy-ignore>
```

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

> **NOTE**: This might not be recommended since it might not be friendly for mobile users.
