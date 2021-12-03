# **NOT RECOMMENDED**

Due to the complex nature of multi page forms, and the changes that have been occuring within the core of `Felte` (e.g. supporting `SolidJS`), many issues have arised with this package so its usage is not recommended. A custom solution for your own use-case will most likely be simpler than the API of this package. For now, [refer to the updated documentation](https://felte.dev/docs/svelte/multi-page-forms) for an example on how to handle multi page forms without using a package.

# @felte/multi-step

[![Bundle size](https://img.shields.io/bundlephobia/min/@felte/multi-step)](https://bundlephobia.com/result?p=@felte/multi-step)
[![NPM Version](https://img.shields.io/npm/v/@felte/multi-step)](https://www.npmjs.com/package/@felte/multi-step)

A package to help you handle multi step forms. This is a simple helper whose API might change a lot and might end up being part of the core package eventually. I would not consider it as a _best practice_ yet.

## Installation

```sh
npm install --save @felte/multi-step

# Or, if you use yarn

yarn add @felte/multi-step
```

## Usage

Instead of importing `createForm` from Felte, import `createForms` from `@felte/multi-step` (you still need Felte as part of your dependencies). This function accepts an object with two properties, an `initialStep` value if you wish to initialize the form in a different step than 0 (the default), and a `pages` property which is an array of objects. Each of them being an individual form's configuration.

```javascript
import { createForms } from '@felte/multi-step';

const { step, pages, increaseStep, decreaseStep, totalSteps } = createForms({
  initialStep: 1,
  pages: [
    {
      onSubmit: ({ increaseStep }) => increaseStep(),
    },
    {
      onSubmit: ({ allValues }) => console.log(allValues),
    },
  ],
});
```

As you may have noticed, the signature for the `onSubmit` function differs to the one used in Felte. It passes an object to you with the following properties:

- `values`: The values submitted on the current step.
- `allValues`: The current value of all the forms on submission.
- `increaseStep`: A helper function to go to the next step.
- `decreaseStep`: A helper function to go to the previous step.
- `step`: A writable store that contains the current step.
- `currentStep`: The current step the form is in.

The object returned by `createForms` contains the following properties:

- `totalSteps`: A number that represents the total steps of the form.
- `increaseStep`: A helper function to go to the next step.
- `decreaseStep`: A helper function to go to the previous step.
- `step`: A writable store that contains the current step.
- `pages`: An array of objects, the same object returned by Felte's `createForm` for each form.

## Typescript

`createForms` accepts a generic argument, it should be a tuple that contains the `Data` shape for each form. Typescript support is still spotty, though. And there's no way to add an "extended" signature as you can do with Felte's `createForm`.


```typescript
import { createForms } from '@felte/multi-step';

type Page1 = {
  name: string;
}

type Page2 = {
  address: string;
}

const { pages } = createForms<[Page1, Page2]>({
  initialStep: 1,
  pages: [
    {
      onSubmit: ({ increaseStep }) => increaseStep(),
    },
    {
      onSubmit: ({ allValues }) => console.log(allValues),
    },
  ],
});
```
