---
'@felte/core': minor
'felte': minor
'@felte/react': minor
'@felte/solid': minor
---

BREAKING: `setFields` no longer touches a field by default. It needs to be explicit and it's only possible when passing a string path. E.g. `setField(‘email’ , 'zaphod@beeblebrox.com')` now is `setFields('email', 'zaphod@beeblebrox.com', true)`.
