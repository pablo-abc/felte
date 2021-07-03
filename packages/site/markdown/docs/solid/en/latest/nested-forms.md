---
section: Nested forms
---

## Nested forms

You can do much more complex form shapes by using "nested" forms, this can be done easily by setting your component name to one using a notation like `"account.email"`.

```html
<form use:form>
  <input name="account.email" type="email" />
  <input name="account.password" type="password" />
  <input name="profile.firstName" />
  <input name="profile.lastName" />
</form>
```

This form would end up creating a `data` store with this shape:

```javascript
{
  account: {
    email: '',
    password: '',
  },
  profile: {
    firstName: '',
    lastName: '',
  },
}
```

Another, arguably, more organized way to do this would be by using the HTML `fieldset` tag.

```html
<form use:form>
  <fieldset name="account">
    <input name="email" type="email" />
    <input name="password" type="password" />
  </fieldset>
  <fieldset name="profile">
    <input name="firstName" />
    <input name="lastName" />
  </fieldset>
</form>
```

This form would create a `data` store with the same shape as above.

Names may also contain an `index` (e.g. `"email[0]"`) to indicate that the value should be set in that specific index of an array. This is useful when handling multiple values or generating inputs from an array. This works in both a `fieldset` element and controls.

```tsx
function Form() {
  const { form } = createForm({ \*...*\ });

  return (
    <form use:form>
      {/* Using a fieldset element */}
      {[0, 1, 2].map(index => (
        <fieldset name={`account[${index}]`}>
          <input name="email" type="email" />
          <input name="password" type="password" />
        </fieldset>
      ))}
      <fieldset name="profile">
        {/* Using the inputs directly */}
        {[0, 1, 2].map(index => (
          <input name={`firstName[${index}]`} />
          <input name={`lastName[${index}]`} />
        ))}
      </fieldset>
    </form>
  )
}
```

If for any reason you want to keep the name without the index, you may also set the index using the `data-felte-index` property. This works for `input`, `textarea` and `fieldset` as well.

```tsx
function Form() {
  const { form } = createForm({ \*...*\ });

  return (
    <form use:form>
      {/* Using a fieldset element */}
      {[0, 1, 2].map(index => (
        <fieldset name="account" data-felte-index={index}>
          <input name="email" type="email" />
          <input name="password" type="password" />
        </fieldset>
      ))}
      <fieldset name="profile">
        {/* Using the inputs directly */}
        {[0, 1, 2].map(index => (
          <input name="firstName" data-felte-index={index} />
          <input name="lastName" data-felte-index={index} />
        ))}
      </fieldset>
    </form>
  )
}
```

> **NOTE**: This attribute will be troublesome when using `radio` inputs since they do need to have a different `name` per group.
