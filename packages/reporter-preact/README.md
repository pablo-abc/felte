# @felte/reporter-preact

[![Bundle size](https://img.shields.io/bundlephobia/min/@felte/reporter-preact)](https://bundlephobia.com/result?p=@felte/reporter-preact)
[![NPM Version](https://img.shields.io/npm/v/@felte/reporter-preact)](https://www.npmjs.com/package/@felte/reporter-preact)

A Felte reporter that uses a custom Preact component to report errors.

## Installation

```sh
# npm
npm i -S @felte/reporter-preact

# yarn
yarn add @felte/reporter-preact
```

## Usage

Its usage is exactly the same as `@felte/reporter-react` except for the import statements.

The package exports a `reporter` function and a `ValidationMessage` component. Pass the `reporter` function to the `extend` option of `useForm` and add the `ValidationMessage` component wherever you want your validation messages to be displayed.

The `ValidationMessage` component needs a `for` prop set with the **name** of the input it corresponds to, the child of `ValidationMessage` is a function that takes the error messages as an argument. This can be either a `string`, an array of `strings`, or `undefined`.

```tsx
import { reporter, ValidationMessage } from '@felte/reporter-preact';
import { useForm } from '@felte/preact';

export function Form() {
  const { form } = useForm({
      // ...
      extend: reporter,
      // ...
    },
  })

  return (
    <form ref={form}>
      <label htmlFor="email">Email:</label>
      <input id="email" type="text" name="email" />
      <ValidationMessage for="email">
        <!-- We assume a there's only going to be one message -->
        {(message) => <span>{message?.[0]}</span>}
      </ValidationMessage>
      <label htmlFor="password">Password:</label>
      <input id="password" type="password" name="password" />
      <ValidationMessage for="password">
        {(message) => <span>{message?.[0]}</span>}
      </ValidationMessage>
      <input type="submit" value="Sign in" />
    </form>
  );
}
```

## Warnings

This reporter can help you display your `warning` messages as well. If you want your `ValidationMessage` component to display the warnings for a field you'll need to set the `level` prop to the value `warning`. By default this prop has a value of `error`.

```html
<ValidationMessage level="warning" for="email">
  {(message) => <span>{message?.[0]}</span>}
</ValidationMessage>
```
