---
section: Multi page forms
---

## Multi page forms

[Where possible, long forms should be divided into multiple smaller forms that constitute a series of logical steps or stages](https://www.w3.org/WAI/tutorials/forms/multi-page/). if you were building something like this on a traditional server-side rendered site, the most logical thing to do is to have a separate, distinct form for each step. The submit action of each step would do something with the current data and go to the next step. If you want to keep your forms in a way that would make them work (with a bit of work) without JS, this is the way you might need to do it with Felte as well. A way to do this would be to make each step a component with its own `createForm` call, and a Svelte store that would keep the state of the whole form on an upper component. But that's not the only solution. In order to ease a bit of this work we've created [`@felte/multi-step`](https://www.npmjs.com/package/@felte/multi-step). It's a package that helps you handle multi page forms by using a single `createForms` call. In order to install it you can use your favorite package manager.

```sh
npm install --save @felte/multi-step

# Or, if you use yarn

yarn add @felte/multi-step
```

Do keep in mind that you do need to have `felte` as a dependency of your project for this to work.

> **NOTE**: This is early work that may not be considered a best practice yet. We're open for this to change considerably depending on usage and eventually merge it into Felte's core if it ends up being useful enough. [Feel free to open an issue if it does not cover your needs](https://github.com/pablo-abc/felte).

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

A more complete and functional example can be found on [CodeSandbox](https://codesandbox.io/s/felte-multi-step-demo-vyxh6?file=/App.svelte).

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
