---
'@felte/common': major
'@felte/core': major
'felte': major
'@felte/react': major
'@felte/solid': major
---

BREAKING: Helpers have been completely reworked.
`setField` and `setFields` have been unified in a single `setFields` helper.
Others such as `setError` and `setWarning` have been pluralized to `setErrors` and `setWarnings` since now they can accept the whole object.
`setTouched` now requires to be passed the value to assign. E.g. `setTouched('path')` is now `setTouched('path', true)`. It no longer accepts an index as an argument since that can be assigned in the path itself using `[]`.
