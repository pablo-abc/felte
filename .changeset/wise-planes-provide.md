---
'@felte/common': major
'@felte/core': major
'felte': major
'@felte/react': major
'@felte/solid': major
---

BREAKING: Stop grabbing nested names from fieldset

This means that this won't work anymore:

```html
<fieldset name="account">
  <input name="email">
</fieldset>
```

So it needs to be changed to this:

```html
<fieldset>
  <input name="account.email">
</fieldset>
```
This was done to allow for future improvements on type-safety, as well to keep consistency with the browser's behaviour when JavaScript is disabled.
