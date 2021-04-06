# @felte/reporter-tippy

![Bundle size](https://img.shields.io/bundlephobia/min/@felte/reporter-tippy)
![NPM Version](https://img.shields.io/npm/v/@felte/reporter-tippy)

A Felte reporter that uses [Tippy.js](https://atomiks.github.io/tippyjs/) to display your error messages.

## Installation

```sh
npm install --save @felte/reporter-tippy tippy.js

# Or, if you use yarn

yarn add @felte/reporter-tippy tippy.js
```

## Usage

The default export is a function that returns the reporter. Add it to the `extend` property of Felte's `createForm` configuration object.

```javascript
import reporter from '@felte/reporter-tippy';

const { form } = createForm({
  // ...
  extend: reporter(),
  // ...
});
```

You might want to add Tippy's styles somewhere in your repo as well

```javascript
import 'tippy.js/dist/tippy.css';
```

## Options

You can pass options to Tippy when calling the reporter like so:

```javascript
reporter({
  tippyProps: {/* tippy options */},
})
```

You can also pass a `setContent` function that will receive the current validation messages and the field path. Here you can modify your validation messages, which can come in useful if you want to display HTML content inside of Tippy. The `messages` argument will either by an array of strings (it can be more than one message depending on your validation strategy) or undefined. The `path` argument will be a string with the full path of your field (e.g. `email`, `account.email`, etc).

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

## Opting out

If this package does not satisfy your needs for all cases, do know we are working on improving this, but you may as well opt-out of reporting a specific field's error by adding `data-felte-reporter-tippy-ignore` as an attribute to your input.

```html
<input name="email" data-felte-reporter-tippy-ignore>
```

## Custom controls

If you're using a custom control not managed by Felte, you can still make use of `@felte/reporter-tippy`. For this you can use two data attributes:

- `data-felte-reporter-tippy-for`: tells this package to use the element with this attribute as a control for the specified field.
- `data-felte-reporter-tippy-trigger-for`: tells this package to use the element(s) with this attribute as a trigger to show Tippy for the specified field.

The custom control will always be a trigger for tippy, the second argument is useful if you want to trigger Tippy with another element such as a label to mimic this package's default behaviour.

```html
<span id="email-label" data-felte-reporter-tippy-trigger-for="email">Email:</span>
<div contenteditable data-felte-reporter-tippy-for="email" aria-labelledby="email-label" tabindex="0" />
```

## Custom positioning

If you need to show your Tippy in a different position, you may use the `data-felte-reporter-tippy-position-for` attribute. This would be useful if you're using a custom control that does use a valid HTML input behind the scenes but hides it:

```html
<!-- Tippy will be shown on top of this div -->
<div data-felte-reporter-tippy-position-for="email" />
<!-- Not on top of this input -->
<input name="email" type="email">
```
