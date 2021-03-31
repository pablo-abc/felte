---
'@felte/reporter-tippy': minor
---

BREAKING: The exported reporter is now a function that accepts options. This allows to pass options to tippy, as well as adds a `setContent` function as an option to dynamically modify Tippy's content to allow for HTML content to be displayed.
