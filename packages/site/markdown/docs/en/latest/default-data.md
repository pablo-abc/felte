---
section: Default data
---

## Default data

Felte will take as default values whatever is set first in the HTML as a value/checked attribute (if the input is "controlled" by Felte).

If the form is not controlled by Felte and you're binding directly to the `data` store, you can use the `initialValues` property of `createForm`'s configuration to set some default values.

```javascript
const { form } = createForm({
  /* ... */
  initialValues: {
    account: {
      email: 'default@email.dev',
    },
  },
  /* ... */
});
```

Note that if you set a value for a "controlled" input, Felte will override it with whatever value it deems appropriate from the input itself. But the `initialValues` property can be useful to have an initial shape for the `data` store before the form element loads.
