---
section: Custom form controls
---

## Custom form controls

If for some reason you're not using an HTML5 input or textarea as an input, you can always bind to the `data` store in order to let Felte manage your custom controls.

```html
<script>
  import { createForm } from 'felte';

  const { form, data } = createForm({ /* ... */ });
</script>

<form use:form>
  <SomeCustomControl bind:value={$data.customControlName} />
</form>
```

You may also use any of the returned helpers from `createForm` for this as well.

```html
<script>
  import { createForm } from 'felte';

  const { form, setField } = createForm({ /* ... */ });

  function handleChange(event) {
    setField('customControlName', event.detail.value);
  }
</script>

<form use:form>
  <SomeCustomControl on:customChangeEvent="{handleChange}" />
</form>
```
