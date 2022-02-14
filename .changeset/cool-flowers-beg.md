---
'@felte/core': major
'felte': major
'@felte/react': major
'@felte/solid': major
---

BREAKING: Stop proxying inputs. This was causing all sorts of race conditions which were a headache to solve. Instead we're going to keep a single recommendation: If you wish to programatically set the value of an input, use the `setFields` helper.
