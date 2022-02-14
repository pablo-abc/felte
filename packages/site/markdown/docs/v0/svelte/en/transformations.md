---
section: Transformations
---

## Transformations

You may need to transform your data in between it being set in your inputs and it being set in the `data` store. For example for handling numeric values on text inputs or transforming a value to a `Date` instance. Felte allows you to do this by using the `transform` property in `createForm`'s configuration object. It accepts either a function or an array of functions. These functions will receive the values of the form _before_ they're assigned to the `data` store, and returns a new object that will be assigned to the store. This can even allow you to change your values shape in Felte.

```javascript
const { form } = createForm({
  //...
  transform: (values) => ({
    ...values,
    shouldBeNumber: parseInt(values.shouldBeNumber, 10),
  }),
})
```

These transformation functions run also when directly setting values to the `data` store (e.g. via `bind:value` or assigning to the `data` store directly).

> **NOTE**: Transformations **must** be syncrhonous.
