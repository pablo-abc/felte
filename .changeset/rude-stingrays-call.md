---
'@felte/common': major
'@felte/core': major
'felte': major
'@felte/react': major
'@felte/solid': major
'@felte/validator-superstruct': major
'@felte/validator-vest': major
'@felte/validator-yup': major
'@felte/validator-zod': major
---

BREAKING: Remove `addWarnValidator` in favour of options to `addValidator`.

This gives a smaller and more unified API, as well as opening to add more options in the future.

If you have an extender using `addWarnValidator`, you must update it by calling `addValidator` instead with the following options:

```javascript
addValidator(yourValidationFunction, { level: 'warning' });
```
