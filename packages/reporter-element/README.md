# @felte/reporter-element

[![Tests](https://github.com/pablo-abc/felte/workflows/Tests/badge.svg)](https://github.com/pablo-abc/felte/actions/workflows/test.yml)
[![Bundle size](https://img.shields.io/bundlephobia/min/@felte/reporter-element)](https://bundlephobia.com/result?p=@felte/reporter-element)
[![NPM Version](https://img.shields.io/npm/v/@felte/reporter-element)](https://www.npmjs.com/package/@felte/reporter-element)
[![codecov](https://codecov.io/gh/pablo-abc/felte/branch/main/graph/badge.svg?token=T73OJZ50LC)](https://codecov.io/gh/pablo-abc/felte)

A Felte reporter that uses a custom element to report errors.

> **WARNING**: This package is under development, things might break on updates and documentation is almost non-existent besides this README.

## Installation

```sh
# npm
npm i -S @felte/reporter-element

# yarn
yarn add @felte/reporter-element
```

## Usage

The package exports a `reporter` function. Pass the `reporter` function to the `extend` option of `createForm` or `useForm`.

`@felte/reporter-element` also defines a custom element globally: `<felte-validation-message>`, you can add this wherever you want your validation message for the specified field to be displayed. It accepts the following props:

* `for`: (required) the name of the field you want to display the validation messages for.
* `max`: (optional) the maximun amount of validation messages to display for the given field. Useful if you can get multiple validation messages but you only want to display a few at a time.
* `level`: (optional) the kind of validation messages this element should display. Set it to `warning` to display warning messages. Default: `error`.
* `templateid` or `templateId`: (optional) the id of the template element to be used for this element.

It expects a `<template>` element as its child (or assigned using `templateid`), which will be used as the template for your validation messages. This template will be cloned into the as a child of `<felte-validation-message>` and updated when validation messages change. The template **must** have an element with an attribute `data-part="item"`. This element is the one that will contain the validation message, and it will be appended for each message. Optionally you can add an element with `data-part="message"` deeper within the item element if you want your message somewhere else.

An example of its usage:

```html
<felte-validation-message for="email" max="2">
  <template>
    <ul aria-live="polite">
      <li data-part="item">
        <em data-part="message"></em>
      </li>
    </ul>
  </template>
</felte-validation-message>
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

A more complete example using `@felte/element`:


```html
<script type="module">
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

## Warnings

This reporter can help you display your `warning` messages as well. If you want your `felte-validation-message` component to display the warnings for a field you'll need to set the `level` prop to the value `warning`. By default this prop has a value of `error`.

```html
<felte-validation-message level="warning" for="email">
  <template>
    <ul aria-live="polite">
      <li data-part="item">
        <em data-part="message"></em>
      </li>
    </ul>
  </template>
</felte-validation-message>
```

## Framework compatibility

This element should work nicely with any framework except React due to an issue on [how React renders `<template>` elements](https://github.com/facebook/react/issues/19932) (although anyway a [specific package for React exists for this same purpose](/packages/reporter-react).
