---
section: Helper functions
subsections:
  - Setters
  - validate
  - reset
  - unsetField
  - resetField
  - addField
  - swapFields
  - moveField
  - setInitialValues
  - createSubmitHandler
---

## Helper functions

The `<felte-form>` element also exposes additional helpers as methods that can help with some more complex use cases.

### Setters

`<felte-form>` exposes setters for each one of our writable stores. Based on _how_ they can be called, there are three different kinds of setters.

#### Object Setters (`setData`, `setTouched`, `setErrors` and `setWarnings`)

Setters for stores that contain objects can be called in four different ways:

- With a string path and a value, in order to set a specific property of a store.
- With a string path and an updater function, in order to update a specific property of a store.
- With an object in order to replace the whole store's value.
- With an updater function to update the whole store's value.

> **NOTE**: TypeScript users, if using the string path version, must always use dot notation even if referring to arrays. E.g. `user.friends.0.name`.

Using `setData` as an example:

```javascript
const felteForm = document.querySelector('felte-form');

// We assume our `data` store to contain: { firstName: '' }

// Sets the property `firstName` of `data` to the value 'Zaphod'
felteForm.setData('firstName', 'Zaphod');
// `data` is now `{ firstName: 'Zaphod' }`

// Updates the property `firstName` of `data` by making it upper case
felteForm.setData('firstName', (firstName) => firstName.toUpperCase());
// `data` is now `{ firstName: 'ZAPHOD' }`

// Replaces the whole value of `data` with the provided object
felteForm.setData({ firstName: 'Zaphod' });
// `data is now `{ firstName: 'Zaphod' }`

// Updates the `data` store by adding the property `lastName` with the value
// 'Beeblebrox'
felteForm.setData(($data) => ({ ...$data, lastName: 'Beeblebrox' }));
// `data` is now `{ firstName: 'Zaphod', lastName: 'Beeblebrox' }`
```

Other helpers are available in a similar way.

#### Fields Setter (`setFields`)

This is, basically, a special version of `setData` that also updates the value in your HTML inputs. You can also automatically `touch` elements by calling either version of the setter that accepts a string path as first argument with a boolean as a third argument. `true` if you want to touch the field, `false` if you do not want this behaviour (default: `false`). Examples of this would be:

- `setFields('firstName', 'Zaphod', true)` would:
  - Set the property `firstName` of `data` to `'Zaphod'`.
  - Set the value in the HTML input with name `firstName` to `'Zaphod'`.
  - Set the property `firstName` of `touched` to `true`.
- `setFields('firstName', (firstName) => firstName.toUpperCase(), true)` would:
  - Update the property `firstName` of `data` by making it uppe case.
  - Set the updated value to the HTML input with name `firstName`.
  - Set the property `firstName` of `touched` to `true`.

#### Primitive Setters (`setIsDirty`,`setIsSubmitting` and `setInteracted`)

The stores `isDirty` and `isSubmitting` do not store an object but a boolean; and `interacted` stores either a string or `null`. Their setters can only be called in two different ways:

- With a value to replace the current value of the store.
- With an updater function to update the store based on its current value.

Using `setIsDirty` as an example:

- `setIsDirty(true)` would set the value of `isDirty` to `true`.
- `setIsDirty(($isDirty) => !$isDirty)` would toggle the value of `isDirty`.

### validate

A function that forces Felte to validate all inputs, touches all of them and updates the `errors` store. It has no arguments.

### reset

A function that resets all inputs and the `data` store to its original values. It has no arguments.

### unsetField

A function that completely removes a field from the `data`, `errors`, `warnings` and `touched` stores. It accepts the path of the field as a first argument as a string.

```javascript
felteForm.unsetField('account.email');
```

### resetField

A function that resets a specific field to its initial value. It accepts the path of the field as a first argument.

```javascript
felteForm.resetField('account.email');
```

### addField

A function specifically to be used when dealing with arrays of fields. It adds the value provided as second argument to the end of the array in the path provided on the first argument. It accepts an index as a third argument to specify where specifically the field should be added.

> **NOTE**: field arrays _must_ be arrays of objects.

```javascript
const felteForm = document.querySelector('felte-form');

// Assuming the property 'todos' contains an of fields

// Adds an empty string to the end of the array in `todos`
felteForm = addField('todos', { value: '' });

// Adds an empty string to index 2 of the array (pushing the rest a position)
felteForm.addField('todos', { value: '' }, 2);
```

`addField` updates the respective properties on `touched`, `errors` and `warnings` accordingly.

### swapFields

A function specifically to be used when dealing with arrays of fields. It swaps fields from a specific path using the provided indexes:

```javascript
// Assuming the property 'todos' contains an of fields

// Swaps the fields of index 1 and 3
felteForm.swapFields('todos', 1, 3);
```

### moveField

A function specifically to be used when dealing with arrays of fields. It moves a field from a specific path from one index to another:

```javascript
// Assuming the property 'todos' contains an of fields

// Moves the field at index 1 to index 3
felteForm.moveField('todos', 1, 3);
```

It will move the other fields accordingly.

### setInitialValues

A helper function that sets the initialValues Felte handles internally. If called after initialization of the form, these values will be used when calling `reset`. It accepts an object with the same shape as your `data` as a first argument.

### createSubmitHandler

A function that creates a submit handler with overriden `onSubmit`, `onError` and/or `validate` functions. If nothing is passed as a first argument, or if any of the three accepted properties is undefined, it will use the values originally assigned to `<felte-form>`'s configuration, either through the property or `prepareForm`.

```html
<script type="module">
  import '@felte/element/felte-form';

  const felteForm = document.querySelector('felte-form');
  felteForm.configuration = {
    onSubmit: (values) => console.log('Default onSubmit'),
  };

  const altOnSubmit = felteForm.createSubmitHandler({
    onSubmit: (values) => console.log('Alternative onSubmit'),
    validate: (values) => /* ... */,
    onError: (errors) => /* ... */,
  });

  document
    .querySelector('#alt-submit')
    .addEventListener('click', altOnSubmit);
</script>

<felte-form>
  <form>
    <input type="email" name="email">
    <input type="password" name="password">
    <button type="submit">Call default submit handler</button>
    <button id="alt-submit" type="submit">
      Call alternative submit handler
    </button>
  </form>
</felte-form>
```

> **NOTE**: The returned submit handler **can** be used outside of the `<form>` tag or be called programatically.
