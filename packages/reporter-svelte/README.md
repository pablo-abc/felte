# @felte/reporter-svelte

![Bundle size](https://img.shields.io/bundlephobia/min/@felte/reporter-svelte)
![NPM Version](https://img.shields.io/npm/v/@felte/reporter-svelte)

A Felte reporter that uses a custom Svelte component to report errors.

## Installation

```sh
npm install --save @felte/reporter-svelte

# Or, if you use yarn

yarn add @felte/reporter-svelte
```

## Usage

The package exports a reporter function `svelteReporter` and a Svelte component `ValidationMessage`. These can be used in conjunction to report errors.

Add the reporter to the `reporter` property of `createForm` configuration.

```javascript
import { svelteReporter, ValidationMessage } from '@felte/reporter-svelte';

const { form } = createForm({
  // ...
  reporter: svelteReporter,
  // ...
});
```

In order to show the errors for a field, you'll need to use the reporter's component. For example

```html
<label for="email">Email:</label>
<input id="email" name="email" aria-describedby="email-validation">
<ValidationMessage form="email" let:messages={messages}>
  {messages}
</ValidationMessage>
```

The `for` property refers to the ID of the input. The messages prop can be either an array of strings or a single string. If no error is reported, nothing will be rendered.
