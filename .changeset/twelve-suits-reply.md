---
'@felte/core': major
'felte': major
'@felte/react': major
'@felte/solid': major
---

BREAKING: Setting directly to `data` using `data.set` no longer touches the field. The `setFields` helper should be used instead if this behaviour is desired.
