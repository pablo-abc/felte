---
'@felte/common': patch
'@felte/core': patch
'@felte/extender-persist': patch
'felte': patch
'@felte/multi-step': patch
'@felte/reporter-cvapi': patch
'@felte/reporter-dom': patch
'@felte/reporter-svelte': patch
'@felte/reporter-tippy': patch
'@felte/solid': patch
'@felte/validator-superstruct': patch
'@felte/validator-vest': patch
'@felte/validator-yup': patch
'@felte/validator-zod': patch
---

Change build output from umd to cjs, since Felte is not planned to be used as a global import, a umd build is not necessary.
