---
section: Dynamic forms
---

## Dynamic forms

Felte watches for any added or removed form controls in your form, updating the `data`, `errors` and `touched` stores accordingly.

```tsx
import { useState } from 'react';
import { useForm } from '@felte/react';

function Form() {
  const { form } = useForm({ /* ... */ });
  const [hasBio, setHasBio] = useState(false);
  const handleChange = () => setHasBio(v => !v);

  return (
    <form ref={form}>
      <input name="username" />
      <input type=checkbox checked={hasBio} onChange={handleChange} />
      {hasBio && <textarea name="bio" />}
    </form>
  );
}
```

If you check the `hasBio` checkbox, the `textarea` will be added to the DOM and Felte will automatically update its stores with the appropriate values without changing anything else.

When a field is removed from the DOM, Felte will also remove it from your stores. If you'd like to keep it in the store even if the field is removed, you can use the atrribute `data-felte-keep-on-remove`.

```html
<textarea name="bio" data-felte-keep-on-remove />
```

If you set this attribute on a fieldset component, this will be applied to all controls within said fieldset unless a specific fieldset overrides this by adding its own `data-felte-keep-on-remove`.

```html
<fieldset name="profile" data-felte-keep-on-remove>
  <!-- will be removed from the store if the fieldset is removed -->
  <input name="name" data-felte-keep-on-remove="false" />
  <!-- won't be removed from the store if the fieldset is removed -->
  <textarea name="bio" />
</fieldset>
```
