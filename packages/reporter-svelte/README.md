# @felte/reporter-svelte

[![Bundle size](https://img.shields.io/bundlephobia/min/@felte/reporter-svelte)](https://bundlephobia.com/result?p=@felte/reporter-svelte)
[![NPM Version](https://img.shields.io/npm/v/@felte/reporter-svelte)](https://www.npmjs.com/package/@felte/reporter-svelte)

A Felte reporter that uses a custom Svelte component to report errors.

## Installation

```sh
npm install --save @felte/reporter-svelte

# Or, if you use yarn

yarn add @felte/reporter-svelte
```

If you're using sapper, you might want to add this reporter as a dev dependency. You can do this by adding the `-D` flag to any of the commands above.

## Usage

The package exports a reporter function `reporter` and a Svelte component `ValidationMessage`. These can be used in conjunction to report errors.

Add the reporter to the `extend` property of `createForm` configuration.

```javascript
import { reporter, ValidationMessage } from '@felte/reporter-svelte';

const { form } = createForm({
  // ...
  extend: reporter,
  // ...
});
```

In order to show the errors for a field, you'll need to use the reporter's component. For example

```html
<label for="email">Email:</label>
<input id="email" name="email" aria-describedby="email-validation">
<ValidationMessage for="email" let:messages={messages}>
  {messages || ''}
</ValidationMessage>
```

The `for` property refers to the ID of the input. The `messages` prop will have whatever the current value of that field's error is. If you want to have a placeholder element be shown instead of handling falsy error values yourself, you can use the `placeholder` slot.

```html
<ValidationMessage for="email" let:messages={message}>
  <span>{message}</span>
  <span slot="placeholder">Some placeholder text</span>
</ValidationMessage>
```

## Warnings

This reporter can help you display your `warning` messages as well. If you want your `ValidationMessage` component to display the warnings for a field you'll need to set the `level` prop to the value `warning`. By default this prop has a value of `error`.

```html
<ValidationMessage level="warning" for="email" let:messages={messages}>
  {messages || ''}
</ValidationMessage>
```
