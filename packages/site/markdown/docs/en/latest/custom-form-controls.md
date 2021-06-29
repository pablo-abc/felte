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

> **NOTE**: If your custom form control uses an `input` or other native form control behind the scenes, you may dispatch an `input` or `change` event from it when the value of it changes (if your control does not do this already). Felte listens to `change` events for `<input type="checkbox">`, `<input type="radio">`, `<select>` and `<input type="file">` elements; and for `input` events on any other type of `input`.
