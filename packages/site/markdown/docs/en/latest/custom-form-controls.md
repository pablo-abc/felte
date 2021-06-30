---
section: Custom form controls
---

## Custom form controls

If for some reason you're not using an HTML5 input, select or textarea element as an input, Felte provides some ways to handle these cases.

### Event dispatchers

Felte requires two characteristics to recognize an input and track it:

1. For the input to be an appropriate native element (`input`, `select`, `textarea`) with a `name` attribute.
2. For the element itself to dispatch `input` and `focusout` events or `change` events.

If you're using a third-party component or a custom component created by you that does not use native form elements, Felte will not recognize it automatically. If you want Felte to track it as any other input, you'll need to find a way to let Felte know the `name` of the field and for it to send the appropriate events. For this reason Felte exports three actions:

- `dispatchInput`: makes the element dispatch an `input` event whenever the parameter passed to it changes.
- `dispatchBlur`: makes the element dispatch a `focusout` event when the parameter passed is `true`.
- `dispatchChange`: makes the element dispatch a `change` event when the parameter passed to it changes.

And to let felte know the name of the field you can add the attribute `data-felte-name` with the appropriate name to the element you're using.

Felte does not "touch" a field on an `input` event (to avoid rapidly changing error messages while typing), it'll only set the field to `touched` when the user focuses out of the field. If your custom control behaves like a `textarea` you may want to use a combination of `dispatchInput` and `dispatchBlur` on it.

```html
<script>
  import { dispatchInput, dispatchBlur } from 'felte';

  let value;
  let blurred;
</script>

<div
  data-felte-name="editable"
  use:dispatchInput={value}
  use:dispatchBlur={blurred}
  on:focusout="{() => (blurred = true)}"
  contenteditable="true"
  bind:textContent={value}
  tabindex="0"
  />
```

If your component behaves like a checkbox, select or any other kind of input that does not require typing you may use `dispatchChange` alone.

```html
<script>
  import { dispatchChange } from 'felte';

  let value;
</script>

<div
  data-felte-name="editable"
  use:dispatchChange={value}
  contenteditable="true"
  bind:textContent={value}
  tabindex="0"
  />
```

This will set the field to `touched` as soon as the value changes.

> **NOTE**: If the value passed to `dispatchChange` or `dispatchInput` is not `undefined` initially, it'll be used as a default value. Since there's no way to know how custom controls may store their values, setting these fields on the `initialValues` property of the configuration object of `createForm` won't set the value of the field in the DOM.

### Data binding

You can always bind to the `data` store in order to let Felte manage your custom controls.

```html
<script>
  import { createForm } from 'felte';

  const { form, data } = createForm({ /* ... */ });
</script>

<form use:form>
  <SomeCustomControl bind:value={$data.customControlName} />
</form>
```

### Helpers

You may also use any of the returned [helpers from `createForm`](/docs/helper-functions) for this as well.

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
