# @felte/reporter-solid

[![Bundle size](https://img.shields.io/bundlephobia/min/@felte/reporter-solid)](https://bundlephobia.com/result?p=@felte/reporter-solid)
[![NPM Version](https://img.shields.io/npm/v/@felte/reporter-solid)](https://www.npmjs.com/package/@felte/reporter-solid)

A Felte reporter that uses a custom Solid component to report errors.

## Installation

```sh
# npm
npm i -S @felte/reporter-solid

# yarn
yarn add @felte/reporter-solid
```

## Usage

The package exports a `reporter` function and a `ValidationMessage` component. Pass the `reporter` function to the `extend` option of `createForm` and add the `ValidationMessage` component wherever you want your validation messages to be displayed.

The `ValidationMessage` component needs a `for` prop set with the **name** of the input it corresponds to, the child of `ValidationMessage` is a function that takes the error messages as an argument. This can be either a `string`, an array of `strings`, or `undefined`.

```tsx
import { reporter, ValidationMessage } from '@felte/reporter-solid';
import { createForm } from '@felte/solid';

export function Form() {
  const { form } = createForm({
      // ...
      extend: reporter,
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
