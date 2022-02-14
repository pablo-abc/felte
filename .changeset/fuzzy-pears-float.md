---
'@felte/common': major
'@felte/core': major
'felte': major
'@felte/react': major
'@felte/solid': major
---

BREAKING: When removing an input from an array of inputs, Felte now splices the array instead of setting the value to `null`/`undefined`. This means that an `index` on an array of inputs is no longer a _unique_ identifier and the value can move around if fields are added/removed.
