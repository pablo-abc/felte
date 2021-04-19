# @felte/reporter-dom

[![Bundle size](https://img.shields.io/bundlephobia/min/@felte/reporter-dom)](https://bundlephobia.com/result?p=@felte/reporter-dom)
[![NPM Version](https://img.shields.io/npm/v/@felte/reporter-dom)](https://www.npmjs.com/package/@felte/reporter-dom)

A Felte reporter that uses the DOM to display your error messages.

## Installation

```sh
npm install --save @felte/reporter-dom

# Or, if you use yarn

yarn add @felte/reporter-dom
```

## Usage

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
<input name="email" aria-describedby="email-validation">
<div id="email-validation" data-felte-reporter-dom-for="email" />
```

You can choose individually if you want to show errors as a `span` or a list wit the attributes `data-felte-reporter-dom-as-single` and `data-felte-reporter-dom-as-list` respectively.

## Styling

This reporter will add the error messages inside of your container element.

If the `single` option is `true`, then it will add a single message in a `span` element with the attribute `data-felte-reporter-dom-single-message`. You can style this with the CSS selector `[data-felte-reporter-dom-single-message]`.

If `single` is `false` the it will add a single list (using the element defined in `listType`) with the attribute `data-felte-reporter-dom-list`. The list will containe a `li` element per message, each with the attribute `data-felte-reporter-dom-list-message`. You can style them using a similar CSS selector as described above.
