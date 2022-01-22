---
'@felte/reporter-react': major
'@felte/reporter-solid': major
'@felte/reporter-svelte': major
---

BREAKING: Remove `index` prop support

This was done in order to allow and simplify further improvements of the type system.

This means this:

```html
<ValidationMessage index="1" for="email">
```

Should be changed to this:

```html
<ValidationMessage for="email.1">
```
