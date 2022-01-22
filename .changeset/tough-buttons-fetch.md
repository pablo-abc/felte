---
'@felte/common': major
'@felte/core': major
'felte': major
'@felte/react': major
'@felte/solid': major
---

BREAKING: Remove `data-felte-index` attribute support.

This means that you should replace this:

```html
<input data-felte-index="1" name="preferences">
```

To this:

```html
<input name="preferences.1">
```

This was done in order to allow for future improvements of the type system for TypeScript users, and to also follow the same behaviour the browser would do if JavaScript is disabled
