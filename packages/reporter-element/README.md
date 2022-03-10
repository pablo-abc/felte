# @felte/reporter-element


[![Bundle size](https://img.shields.io/bundlephobia/min/@felte/reporter-element)](https://bundlephobia.com/result?p=@felte/reporter-element)
[![NPM Version](https://img.shields.io/npm/v/@felte/reporter-element)](https://www.npmjs.com/package/@felte/reporter-element)

A Felte reporter that uses a web component to report errors.

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

It expects a `<template>` element as its slot (or assigned using `templateid`), which will be used as the template for your validation messages. This template will be cloned into the shadow DOM and updated when validation messages change. The template **must** have an element with an attribute `part="item"`. This element is the one that will contain the validation message, and it will be appended for each message. Optionally you can add an element with `part="message"` deeper within the item element if you want your message somewhere else.

An example of its usage:

```html
<felte-validation-message for="email" max="2">
  <template>
    <ul aria-live="polite">
      <li part="item">
        <em part="message"></em>
      </li>
    </ul>
  </template>
</felte-validation-message>
```

When using `templateid`, this package expects the template to be either on the light DOM, or on the immediate parent's shadow root. If it's somewhere else, it _will not_ find it.

```html
<template id="message-template">
  <ul aria-live="polite">
    <li part="item">
      <em part="message"></em>
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
        <span part="message" />
      </template>
    </felte-validation-message>
    <input type="password" name="password" />
    <felte-validation-message for="password">
      <template>
        <ul aria-live="polite">
          <li part="item" />
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
      <li part="item">
        <em part="message"></em>
      </li>
    </ul>
  </template>
</felte-validation-message>
```

## Styling

Since the contents of your template will be inserted on the shadow DOM, you'll need to use the CSS selector `::part` to style the messages. For example:

```html
<style>
  felte-validation-message::part(container) {
    color: #ff3a43;
    margin: 0;
    padding: 0;
  }

  felte-validation-message::part(item) {
    list-style: disc inside;
  }
</style>

<felte-validation-message level="warning" for="email">
  <template>
    <ul aria-live="polite" part="container">
      <li part="item"></li>
    </ul>
  </template>
</felte-validation-message>
```

You may also add a `<style>` tag inside of the template:

```html
<felte-validation-message level="warning" for="email">
  <template>
    <style>
      ul {
        color: #ff3a43;
        margin: 0;
        padding: 0;
      }

      li {
        list-style: disc inside;
      }
    </style>
    <ul aria-live="polite" part="container">
      <li part="item"></li>
    </ul>
  </template>
</felte-validation-message>
```

You are in control of the contents of the shadow DOM of this element, so you can freely add parts to it for easier styling. The only parts that have "special" meaning are `item` and `message`.
