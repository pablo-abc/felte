---
'@felte/common': major
'@felte/core': major
'felte': major
'@felte/solid': major
---

BREAKING: Remove `getField` helper in favor of `getValue` export. E.g. `getField('email')` now is `getValue($data, 'email')` and accessors.
