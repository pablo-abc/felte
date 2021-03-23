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

Another, arguably, more organized way to do this would be by using the HTML `fieldset` tag.

```html
<form use:form>
  <fieldset name="account">
    <input name="email" type="email">
    <input name="password" type="password">
  </fieldset>
  <fieldset name="profile">
    <input name="firstName">
    <input name="lastName">
  </fieldset>
</form>
```

This form would create a `data` store with the same shape as above.
