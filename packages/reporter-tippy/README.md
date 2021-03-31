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
