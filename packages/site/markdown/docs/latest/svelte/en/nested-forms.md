---
section: Nested forms
---

## Nested forms

You can do much more complex form shapes by using "nested" forms, this can be done easily by setting your component name to one using a notation like `"account.email"`.

```html
<form use:form>
  <input name="account.email" type="email">
  <input name="account.password" type="password">
  <input name="profile.firstName">
  <input name="profile.lastName">
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

Names may also contain an index (e.g. `"email.0.value"`) to indicate that the value should be set in that specific index of an array. This is useful when handling multiple values or generating inputs from an array.

> **NOTE**: In order to differentiate checkbox values from arrays of fields, array of fields _require_ its name to refer to the property of an object (e.g. `"email.0.value"`).

```html
<form use:form>
  {#each [0, 1, 2] as index}
    <input name="account.{index}.email" type="email">
    <input name="account.{index}.password" type="password">
  {/each}
</form>
```
