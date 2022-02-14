---
'@felte/core': major
'felte': major
'@felte/react': major
'@felte/solid': major
---

BREAKING: Remove `data-felte-unset-on-remove` in favour of `data-felte-keep-on-remove`. Felte will now remove fields by default if removed from the DOM.

To keep the same behaviour as before, add `data-felte-keep-on-remove` to any dynamic inputs you had that didn't have `data-felte-unset-on-remove` previously. And remove `data-felte-unset-on-remove` from the inputs that had it, or replace it for `data-felte-keep-on-remove="false"` if it was used to override a parent's attribute.
