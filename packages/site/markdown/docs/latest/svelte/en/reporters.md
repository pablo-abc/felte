---
section: Reporters
subsections:
  - Using a Solid component
  - Using the DOM
  - Using Tippy.js
  - Using the constraint validation API
---

## Reporters

Felte offers an easy _plugin-like_ way of reporting your errors by using what we call `reporters`. Making use of Felte's extensibility, their job is to handle errors for you. The degree to which they do that depends on how each reporter is build. For example they can report your errors using a tooltip, or modifying the DOM itself to add your validation messages. You may use any of the official packages we provide, or [you can build your own](/docs/solid/extending-felte).

### Using a Solid component

The `@felte/reporter-solid` package will most likely be the preferred option to report errors.

```sh
# npm
npm i -S @felte/reporter-solid

# yarn
yarn add @felte/reporter-solid
```

It exports a `reporter` function and a `ValidationMessage` component. Pass the `reporter` function to the `extend` option of `createForm` and add the `ValidationMessage` component wherever you want your validation messages to be displayed.

The `ValidationMessage` component needs a `for` prop set with the **name** of the input it corresponds to, the child of `ValidationMessage` is a function that takes the error messages as an argument. This can be either a `string`, an array of `strings`, or `undefined`.

```tsx
import { reporter, ValidationMessage } from '@felte/reporter-solid';
import { createForm } from '@felte/solid';

export function Form() {
  const { form } = createForm({
      // ...
      extend: reporter, // or [reporter]
      // ...
    },
  })

  return (
    <form use:form>
      <input id="email" type="text" name="email" />
      <ValidationMessage for="email">
        <!-- We assume a single string will be passed as a validation message -->
        <!-- This can be an array of strings depending on your validation strategy -->
        {(message) => <span>{message}</span>}
      </ValidationMessage>
      <input type="password" name="password" />
      <ValidationMessage for="password">
        {(message) => <span>{message}</span>}
      </ValidationMessage>
      <input type="submit" value="Sign in" />
    </form>
  );
}
```

You may also display warning messages from your `warnings` store by adding a prop `level="warning"` to the `ValidationMessage` component.

```html
<ValidationMessage level="warning" for="email" let:messages={messages}>
  {messages || ''}
</ValidationMessage>
```

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
import { createForm } from '@felte/solid';

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

You can also pass a `setContent` function that will receive the current validation messages for the field and its path. Here you can modify your validation messages, which can come in useful if you want to display HTML content inside of Tippy. The `messages` argument will either by an array of strings (it can be more than one message depending on your validation strategy) or undefined. The `path` argument will be a string with the full path of your field (e.g. `email`, `account.email`, etc).

```javascript
reporter({
  setContent: (messages, path) => {
    return messages?.map(message => `<p>${message}</p>`);
  },
  tippyProps: {
    allowHTML: true,
  },
})
```

You may also pass options to a specific Tippy instance using the `tippyPropsMap` property. It expects an object with the same shape as your data:

```javascript
reporter({
  tippyPropsMap: {
    account: {
      email: {
        allowHTML: true,
        /* other tippy props */
      },
    },
  },
})
```

You may also opt-out of this package reporting your errors for a specific field by adding `data-felte-reporter-tippy-ignore` to the input:

```html
<input name="email" data-felte-reporter-tippy-ignore />
```

If you're using a custom control not managed by Felte, you can still make use of `@felte/reporter-tippy`. For this you can use two data attributes:

- `data-felte-reporter-tippy-for`: tells this package to use the element with this attribute as a control for the specified field.
- `data-felte-reporter-tippy-trigger-for`: tells this package to use the element(s) with this attribute as a trigger to show Tippy for the specified field.

The custom control will always be a trigger for tippy, the second argument is useful if you want to trigger Tippy with another element such as a label to mimic this package's default behaviour.

```html
<span id="email-label" data-felte-reporter-tippy-trigger-for="email">Email:</span>
<div contenteditable data-felte-reporter-tippy-for="email" aria-labelledby="email-label" tabindex="0" />
```

If you need to show your Tippy in a different position, you may use the `data-felte-reporter-tippy-position-for` attribute. This would be useful if you're using a custom control that does use a valid HTML input behind the scenes but hides it:

```html
<!-- Tippy will be shown on top of this div -->
<div data-felte-reporter-tippy-position-for="email" />
<!-- Not on top of this input -->
<input name="email" type="email" />
```

#### Warnings

This reporter can also display your warning messages. In order to do so you'll need to pass the property `level` to your reporter with a value of `warning`.

```javascript
reporter({
  level: 'warning'
})
```

> In order to avoid cluttering your UI it'd be recommended to use Tippy to report errors _OR_ warnings, not both.

### Using the DOM

The `@felte/reporter-dom` is similar to the `@felte/reporter-solid` package, but it modifies the dom directly for you.

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
<input name="email" aria-describedby="email-validation" />
<div id="email-validation" data-felte-reporter-dom-for="email" aria-live="polite" />
```

You can choose individually if you want to show errors as a `span` or a list with the attributes `data-felte-reporter-dom-as-single` and `data-felte-reporter-dom-as-list` respectively.

#### Warnings

This reporter can help you display your `warning` messages as well. If you want this reporter to insert a warning message in a DOM element, you'll want to set the attribute `data-felte-reporter-dom-level` with the value `warning`. By default it would display errors.

```html
<label for="email">Email:</label>
<input name="email" aria-describedby="email-validation">
<div
  id="email-validation"
  data-felte-reporter-dom-for="email"
  data-felte-reporter-dom-level="warning"
  />
```

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
import { createForm } from '@felte/solid';
import reporter from '@felte/reporter-cvapi';

const { form } = createForm({
  // ...
  extend: reporter,
  // ...
});
```

And that's it!

> **NOTE**: This might not be recommended since it might not be friendly for mobile users.
