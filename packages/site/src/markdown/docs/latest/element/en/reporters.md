---
section: Reporters
subsections:
  - Using a custom element
  - Using the DOM
  - Using Tippy.js
  - Using the constraint validation API
---

## Reporters

Felte offers an easy _plugin-like_ way of reporting your errors by using what we call `reporters`. Making use of Felte's extensibility, their job is to handle errors for you. The degree to which they do that depends on how each reporter is build. For example they can report your errors using a tooltip, or modifying the DOM itself to add your validation messages. You may use any of the official packages we provide, or [you can build your own](/docs/element/extending-felte).

### Using a custom element

The `@felte/reporter-element` package provides the most flexible way to report errors using a custom element.

```sh
# npm
npm i -S @felte/reporter-element

# yarn
yarn add @felte/reporter-element
```

It exports a `reporter` function and defines a custom element `<felte-validation-message>`. Pass the `reporter` function to the `extend` option of Felte's configuration. The main export also exposes the `ValidationMessage` class which you can use to register the validation message custom element with a tag of your choosing. Alternatively, importing side effects from `@felte/reporter-element/felte-validation-message` automatically registers the custom element as `<felte-validation-message`.

Assuming you used the side effecst import, add the `<felte-validation-message>` element wherever you want your validation messages to be displayed.

The `<felte-validation-message>` component needs a `for` attribute set with the **name** of the input it corresponds to. It expects a `<template>` element as its child (or assigned using `templateid`), which will be used as the template for your validation messages. This template will be cloned into the as a child of `<felte-validation-message>` and updated when validation messages change. The template **must** have an element with an attribute `data-part="item"`. This element is the one that will contain the validation message, and it will be appended for each message. Optionally you can add an element with `data-part="message"` deeper within the item element if you want your message somewhere else.

```html
<script type="module">
  import '@felte/reporter-element/felte-validation-message';
  import { reporter } from '@felte/reporter-element';
  import { prepareForm } from '@felte/element';

  prepareForm('signin', {
    // ...
    extend: reporter,
    // ...
  })
</script>

<!-- For the first element, we assume there will only be a single message at all times -->
<felte-form id="signin">
  <form>
    <input id="email" type="text" name="email" />
    <felte-validation-message for="email" max="1">
      <template>
        <span data-part="message" />
      </template>
    </felte-validation-message>
    <input type="password" name="password" />
    <felte-validation-message for="password">
      <template>
        <ul aria-live="polite">
          <li data-part="item" />
        </ul>
      </template>
    </felte-validation-message>
    <input type="submit" value="Sign in" />
  </form>
</felte-form>
```

When using `templateid`, this package expects the template to be either on the light DOM, or on the immediate parent's shadow root. If it's somewhere else, it _will not_ find it.

```html
<template id="message-template">
  <ul aria-live="polite">
    <li data-part="item">
      <em data-part="message"></em>
    </li>
  </ul>
</template>

<felte-validation-message for="email" templateid="message-template"></felte-validation-message>

<felte-validation-message for="password" templateid="message-template"></felte-validation-message>
```

You may also display warning messages from your `warnings` store by adding an attribute `level="warning"` to the `<felte-validation-message>` element.

```html
<felte-validation-message level="warning" for="email">
  <template>
    <ul aria-live="polite">
      <li data-part="item" />
    </ul>
  </template>
</felte-validation-message>
```

All the attributes/properties accepted by `<felte-validation-message>` are:

* `for`: (required) the name of the field you want to display the validation messages for.
* `max`: (optional) the maximun amount of validation messages to display for the given field. Useful if you can get multiple validation messages but you only want to display a few at a time.
* `level`: (optional) the kind of validation messages this element should display. Set it to `warning` to display warning messages. Default: `error`.
* `templateid` (attribute) or `templateId` (property): (optional) the id of the template element to be used for this element.

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
import '@felte/element';

const felteForm = document.querySelector('felte-form');
felteForm.configuration = {
  // ...
  extend: reporter(),
  // ...
};
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
<input name="email" data-felte-reporter-tippy-ignore>
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

> **NOTE**: Since the release of `@felte/reporter-element`, this might not be preferred anymore since `reporter-element` provides a more flexible API.

The `@felte/reporter-dom` is similar to the `@felte/reporter-element` package, but it modifies the dom directly for you and assumes a layout, instead of letting you define it using a template.

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

const felteForm = document.querySelector('felte-form');

felteForm.configuration = {
  // ...
  extend: reporterDom(),
  // ...
};
```

In order to show the errors for a field, you'll need to add a container for each of these elements. For example

```html
<label for="email">Email:</label>
<input name="email" aria-describedby="email-validation">
<div id="email-validation" data-felte-reporter-dom-for="email" aria-live="polite">
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
import { prepareForm } from '@felte/element';
import reporter from '@felte/reporter-cvapi';

prepareForm('felte-form-id', {
  // ...
  extend: reporter,
  // ...
});
```

And that's it!

> **NOTE**: This might not be recommended since it might not be friendly for mobile users.
