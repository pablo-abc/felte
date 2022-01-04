---
section: Custom form controls
---

## Custom form controls

If for some reason you're not using an HTML5 input, select or textarea element as an input, you can always use any of the returned [helpers from `useForm`](/docs/react/helper-functions) for handling inputs.

```tsx
import { useForm } from '@felte/react';

export function Form() {
  const { form, setData } = useForm({ /* ... */ });

  function handleChange(event) {
    setData('customControlName', event.detail.value);
  }

  return (
    <form ref={form}>
      <SomeCustomControl on:customChangeEvent={handleChange} />
    </form>
  );
}
```

> **NOTE**: If your custom form control uses an `input` or other native form control behind the scenes, you may dispatch an `input` or `change` event from it when the value of it changes (if your control does not do this already). Felte listens to `change` events for `<input type="checkbox">`, `<input type="radio">`, `<select>` and `<input type="file">` elements; and for `input` events on any other type of `input`.
