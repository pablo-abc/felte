---
section: Custom form controls
subsections:
  - Using helpers
  - Using felte-field
---

## Custom form controls

If for some reason you're not using an HTML5 input, select or textarea element as an input, you have two options:

### Using helpers

The more straightforward way would be to use any of the returned [helpers from `<felte-form>`](/docs/element/helper-functions) for handling inputs.

```html
<script type="module">
  import '@felte/element';

  const felteForm = document.querySelector('felte-form');
  const customControl = document.querySelector('some-custom-control');

  customControl.addEventListener('customchangeevent', (event) => {
    felteForm.setFields('customControlName', event.detail.value, true);
  });
</script>

<felte-form>
  <form>
    <some-custom-control></some-custom-control>
  </form>
</felte-form>
```

If your custom form control uses an `input` or other native form control behind the scenes, you may dispatch an `input` or `change` event from it when the value of it changes (if your control does not do this already). Felte listens to `change` events for `<input type="checkbox">`, `<input type="radio">`, `<select>` and `<input type="file">` elements; and for `input` events on any other type of `input`.

### Using felte-field

You might want to use other custom elements as inputs for your form. Custom elements generally hide all of its behaviour via a Shadow DOM, and some times they may use events with different names for events. For this situations you can use `<felte-field>`.

```html
<script type="module">
  import '@felte/element';
</script>

<felte-field name="fieldName" valueprop="textContent">
  <div contenteditable role="textbox" tabindex="0"></div>
</felte-field>
```

> **NOTE**: `<felte-field>` can be imported directly from `@felte/element/dist/felte-field.js` or `@felte/element/dist/felte-field.min.js`.

The previous element will behave just like a regular `input` when used within a form managed by Felte. Only requiring a `name` prop.

The previous example also shows that you can use the `valueprop` attribute to specify which attribute will contain the value of the input. All attributes/properties accepted by `<felte-field>` are:

- `name`: (string, required) The name of the field.
- `valueprop`/`valueProp`: (string, optional) The property of the element that will contain the value of the input (default: `value`).
- `inputevent`/`inputEvent`: (string, optional) The name of the event that will be dispatched by the custom input when the value changes. (default: `input`)
- `blurevent`/`blurEvent`: (string, optional) The name of the event that will be dispatched when the custom input loses focus. (default: `focusout`)
- `composed`: (boolean, optional) If the custom elemet uses a native input underneath, setting this attribute tells `<felte-field>` to expect a composed event dispatched from within the Shadow DOM, and to use its original target (instead of the custom element) as its source of truth. (default: `false`)
- `value`: (string, optional) It can be used as a way to assign a default value to the field. For example, some custom elements would stringify `undefined` so assigning this attribute as `value=""` should assing an empty string as default value. (default: `undefined`)
- `touchonchange`/`touchOnChange`: (boolean, optional) Tells Felte to immediately set the field as touched when the value changes. Useful for custom elements that function as checkboxes and such. (default: `false`)
- `target`: (string, optional) A CSS selector for the field. Useful when using custom elements that _need_ to be direct children of other custom elements to work properly (like labels).

> **NOTE**: The name after a slash (`/`) refers to the same attribute but accessed as a property.
