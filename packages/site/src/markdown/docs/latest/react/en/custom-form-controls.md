---
section: Custom form controls
subsections:
  - Using helpers
  - Using useField
---

## Custom form controls

If for some reason you're not using an HTML5 input, select or textarea element as an input, you have two options:

### Using helpers

The more straightforward way would be to use any of the returned [helpers from `useForm`](/docs/react/helper-functions) for handling inputs.

```jsx
import { useForm } from '@felte/react';

export function Form() {
  const { form, setFields } = useForm({
    initialValues: {
      customControlName: '',
    },
    // ...
  });

  function handleChange(event) {
    setFields('customControlName', event.detail.value, true);
  }

  return (
    <form ref={form}>
      <SomeCustomControl onCustomChangeEvent={handleChange} />
    </form>
  );
}
```

If your custom form control uses an `input` or other native form control behind the scenes, you may dispatch an `input` or `change` event from it when the value of it changes (if your control does not do this already). Felte listens to `change` events for `<input type="checkbox">`, `<input type="radio">`, `<select>` and `<input type="file">` elements; and for `input` events on any other type of `input`.

### Using useField

You might want to create a shareable component that should work with Felte without needing to use any of the helpers. If said component uses a native HTML control, and your user interacts directly with it, then assigning a `name` to it should be enough for Felte to manage it. But there might be situations on which the control itself is completely custom made, maybe using an `input[type="hidden"]` behind the scenes or not using a native control at all (e.g. a `contenteditable` div). For this situations you can use `useField`.

`useField` provides you with some helpers to make your custom control visible to Felte without needing to use any of `useForm`'s helpers. Its usage looks something like:

```jsx
import React from 'react';
import { useField } from '@felte/react';

function CustomInput({ name, labelId }) {
  const { field, onChange, onBlur } = useField(name);

  function handleChange(e) {
    onChange(e.currentTarget.innerText);
  }

  return (
    <div
      ref={field}
      onInput={handleChange}
      onBlur={onBlur}
      aria-labelledby={labelId}
      role="textbox"
      contentEditable
      tabIndex={0}
    />
  );
}
```

The previous component will behave just like a regular `input` when used within a form managed by Felte. Only requiring a `name` prop.

`useField` can be called in two different ways:

- With the name as a first argument, and optionally an `options` objects as a second argument.
- With an `options` object as first argument containig `name` as a property of it.

The options accepted by `useField` are:

- `name`: only when passing `options` as first argument. It's the `name` of the field.
- `defaultValue`: (Optional) the field's default value. Defaults to `undefined`.
- `touchOnChange`: (Optional) if set to `true`, the field will be marked as "touched" with a call to `onChange`. If `false`, the field will only be marked as "touched" when calling `onBlur`. Defaults to `false`.
- `onFormReset`: (Optional) a function that will be called when the form containing your field emits a `reset` event. It will receive the event object from the `reset` event.

`useField` returns an object with the following properties:

- `field`: a ref that _must_ be assigned to the focusable (tabIndex === 0) element of your control. It must be assigned in order for the following functions to do anything.
- `onChange`: a function that receives a value to be assigned to the field.
- `onInput`: an alias for `onChange`.
- `onBlur`: a function that needs to be called in order to mark a field as "touched" if `touchOnChange` is `false`. Not needed if `touchOnChange` is `true`. Useful if your custom control should behave like a text box.

> **NOTE**: when creating custom controls like this, be mindful of the accessibility of your component. Handling proper keyboard interactions, roles and labels is a must for your custom control to be seen as an input by assistive technologies.
