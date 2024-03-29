---
section: Default data
---

## Default data

Felte will take as default values whatever is set first in the HTML as a value/checked attribute (if the input is "controlled" by Felte).

```html
<felte-form>
  <form>
    <input name="email" type="email" value="default@email.com">
  </form>
</felte-form>
```

In this case, Felte will take `default@email.com` as a default value for the "email" field.

An alternative to this would be to use the `initialValues` property of the configuration for `prepareForm` (or the element itself). This can also be useful if the form element is not controlled by Felte and you're binding directly to the `data` store.

```javascript
prepareForm('felte-form-id', {
  /* ... */
  initialValues: {
    account: {
      email: 'default@email.dev',
    },
  },
  /* ... */
});
```
