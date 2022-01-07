---
section: Dynamic forms
---

## Dynamic forms

Felte watches for any added or removed form controls in your form, updating the `data`, `errors` and `touched` stores accordingly.

```html
<script>
  import { createForm } from 'felte';

  const { form } = createForm({ /* ... */ });

  let hasBio = false;
</script>

<form use:form>
  <input name="username">
  <input type=checkbox bind:checked={hasBio}>
  {#if hasBio}
    <textarea name="bio" />
  {/if}
</form>
```

If you check the `hasBio` checkbox, the `textarea` will be added to the DOM and Felte will automatically update its stores with the appropriate values without changing anything else.

By default, if you remove an input from the form Felte will not clear the value of the `data` store. If you want this behaviour, you can add the `data-felte-unset-on-remove` attribute to your input.

```html
<textarea name="bio" data-felte-unset-on-remove />
```

This attribute can be added to any form control or `fieldset` tag. If you set this attribute on a `fieldset` but you've specified a `data-felte-unset-on-remove="false"` attribute on an input within it, Felte will not remove that specific value from the stores.

```html
<fieldset name="profile" data-felte-unset-on-remove>
  <!-- won't be removed from the store if the fieldset is removed -->
  <input name="name" data-felte-unset-on-remove="false">
  <!-- will be removed from the store if the fieldset is removed -->
  <textarea name="bio" />
</fieldset>
```
